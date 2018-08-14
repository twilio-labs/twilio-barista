const { Request, Response } = require('jest-express');
const basicAuth = require('basic-auth');

process.env.LOGINS = 'twilio,somePassword,admin;owl,anotherPassword,user';

const { authenticate, gateForAdmin } = require('./auth');

describe('utils/auth', () => {
  let request;
  let response;
  let next;

  beforeEach(() => {
    request = new Request();
    response = new Response();
    next = jest.fn();
  });

  afterEach(() => {
    basicAuth.mockResetUser();
  });

  describe('authenticate', () => {
    test('handles no user', () => {
      authenticate(request, response, next);
      expect(response.set).toHaveBeenCalledWith(
        'WWW-Authenticate',
        'Basic realm=Authorization Required'
      );
      expect(response.sendStatus).toHaveBeenCalledWith(401);
    });

    test('handles invalid password', () => {
      basicAuth.mockSetUser({
        name: 'twilio',
        pass: 'wrongPassword',
      });
      authenticate(request, response, next);
      expect(response.set).toHaveBeenCalledWith(
        'WWW-Authenticate',
        'Basic realm=Authorization Required'
      );
      expect(response.sendStatus).toHaveBeenCalledWith(401);
    });

    test('sets correct role for admin', () => {
      basicAuth.mockSetUser({ name: 'twilio', pass: 'somePassword' });
      authenticate(request, response, next);
      expect(request.user).toBe('admin');
      expect(next).toHaveBeenCalledTimes(1);
    });

    test('sets correct role for user', () => {
      basicAuth.mockSetUser({ name: 'owl', pass: 'anotherPassword' });
      authenticate(request, response, next);
      expect(request.user).toBe('user');
      expect(next).toHaveBeenCalledTimes(1);
    });
  });

  describe('gateForAdmin', () => {
    test('forwards request for admin', () => {
      basicAuth.mockSetUser({ name: 'twilio', pass: 'somePassword' });
      gateForAdmin(request, response, next);
      expect(next).toHaveBeenCalledTimes(1);
    });

    test('blocks requests for users', () => {
      basicAuth.mockSetUser({ name: 'owl', pass: 'anotherPassword' });
      gateForAdmin(request, response, next);
      expect(next).toHaveBeenCalledTimes(0);
      expect(response.sendStatus).toHaveBeenCalledWith(403);
    });
  });
});
