jest.mock('../data/config');
jest.mock('./twilio');

const { Request, Response } = require('jest-express');

const { handler } = require('./kiosk');
const { mockSetConfig } = require('../data/config');
const { restClient } = require('./twilio');

describe('api/kiosk', () => {
  let request;
  let response;

  beforeEach(() => {
    request = new Request();
    response = new Response();
  });

  describe('handler', () => {
    beforeEach(() => {
      mockSetConfig({
        visibleNumbers: '+49123456789,+49987654321',
        mode: 'barista',
      });
    });

    test('retrieves visible phone numbers', async () => {
      request.query = { eventId: 'testId' };
      await handler(request, response);
      expect(response.send).toHaveBeenCalledWith({
        phoneNumbers: [
          {
            countryCode: 'DE',
            phoneNumber: '+49123456789',
            emoji: '🇩🇪',
          },
          {
            countryCode: 'DE',
            phoneNumber: '+49987654321',
            emoji: '🇩🇪',
          },
        ],
        eventType: 'barista',
      });
    });

    test('handles invalid numbers', async () => {
      request.query = { eventId: 'testId' };
      mockSetConfig({
        visibleNumbers: '+49123456789,INVALID_NUMBER,+49987654321',
        mode: 'bartender',
      });

      await handler(request, response);
      expect(response.send).toHaveBeenCalledWith({
        phoneNumbers: [
          {
            countryCode: 'DE',
            phoneNumber: '+49123456789',
            emoji: '🇩🇪',
          },
          {
            countryCode: 'DE',
            phoneNumber: '+49987654321',
            emoji: '🇩🇪',
          },
        ],
        eventType: 'bartender',
      });
    });

    test('sanitizes numbers', async () => {
      request.query = { eventId: 'testId' };
      mockSetConfig({
        visibleNumbers: '+49 123 456789,  ,+49987654321',
        mode: 'bartender',
      });

      await handler(request, response);
      expect(restClient.lookups.phoneNumbers).toHaveBeenCalledTimes(2);
      expect(restClient.lookups.phoneNumbers).toHaveBeenCalledWith(
        '+49123456789'
      );
      expect(restClient.lookups.phoneNumbers).toHaveBeenLastCalledWith(
        '+49987654321'
      );
      expect(response.send).toHaveBeenCalledWith({
        phoneNumbers: [
          {
            countryCode: 'DE',
            phoneNumber: '+49 123 456789',
            emoji: '🇩🇪',
          },
          {
            countryCode: 'DE',
            phoneNumber: '+49987654321',
            emoji: '🇩🇪',
          },
        ],
        eventType: 'bartender',
      });
    });
  });
});
