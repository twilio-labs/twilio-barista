const createToken = jest.fn().mockReturnValue('some.jwt.token');

const restClient = {};

restClient.lookups = {
  mockShouldThrow: false,
  phoneNumbers: jest.fn(num => ({
    fetch: jest.fn(() => {
      if (restClient.lookups.mockShouldThrow) {
        throw new Error('Fail');
      } else if (num === 'INVALID_NUMBER') {
        throw new Error('Invalid Number');
      }
      return { countryCode: 'DE' };
    }),
  })),
};

module.exports = {
  createToken,
  restClient,
};
