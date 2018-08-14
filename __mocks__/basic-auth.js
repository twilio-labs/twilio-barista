let user;

function basicAuth() {
  return user;
}

basicAuth.mockSetUser = function __setUser(newUser) {
  user = newUser;
};

basicAuth.mockResetUser = function __resetUser() {
  user = undefined;
};

module.exports = basicAuth;
