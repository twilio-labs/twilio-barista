let mockConfig = {};

function mockSetConfig(conf) {
  mockConfig = conf;
}

function config() {
  return mockConfig;
}

module.exports = {
  mockSetConfig,
  config,
};
