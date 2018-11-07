jest.mock('./twilio');

const { Request, Response } = require('jest-express');

const { handler, handlerDashboard } = require('./token');

describe('api/token', () => {
  let request;
  let response;

  beforeEach(() => {
    request = new Request();
    response = new Response();
  });

  describe('handler', () => {
    test('handles unauthenticated user', () => {
      handler(request, response);
      expect(response.status).toHaveBeenCalledWith(401);
    });

    test('handles authenticated user', () => {
      request.user = 'admin';
      handler(request, response);
      expect(response.send).toHaveBeenCalledWith({
        token: 'some.jwt.token',
        identity: 'admin',
      });
    });
  });

  describe('handlerDashboard', () => {
    test('handles unauthenticated user', () => {
      handlerDashboard(request, response);
      expect(response.send).toHaveBeenCalledWith({
        token: 'some.jwt.token',
        identity: 'dashboard',
      });
    });

    test('handles authenticated user', () => {
      request.user = 'admin';
      handlerDashboard(request, response);
      expect(response.send).toHaveBeenCalledWith({
        token: 'some.jwt.token',
        identity: 'dashboard',
      });
    });
  });
});
