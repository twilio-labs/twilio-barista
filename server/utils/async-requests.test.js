const { Request, Response } = require('jest-express');
const { safe } = require('./async-requests');

describe('utils/async-requests/safeAsyncRequestHandler', () => {
  let request;
  let response;
  let handler;

  beforeEach(() => {
    request = new Request();
    request.log = {
      error: jest.fn(),
    };
    response = new Response();
    handler = jest.fn(() => Promise.resolve());
  });

  test('returns handler function', () => {
    const safeHandler = safe(handler);
    expect(typeof safeHandler).toBe('function');
  });

  test('calls passed function', () => {
    const safeHandler = safe(handler);
    safeHandler(request, response);
    expect(handler).toHaveBeenCalledWith(request, response, undefined);
  });

  // test('should catch error and log', () => {
  //   const myError = new Error('my error');
  //   const errorHandler = jest.fn().mockRejectedValue(myError);
  //   const safeHandler = safe(errorHandler);
  //   safeHandler(request, response);
  //   expect(errorHandler).toHaveBeenCalledWith(request, response, undefined);
  //   // expect(request.log.error).toHaveBeenCalledWith(myError);
  //   expect(response.status).toHaveBeenCalledWith(500);
  //   expect(response.send).toHaveBeenCalledWith('An internal error occurred');
  // });
});
