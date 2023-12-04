const { config } = require('./config');

function sortByLengthDesc(a, b) {
  return b.length - a.length;
}

/**
 * Determines based on a message which coffee is trying to be ordered.
 *
 * @param {any} messageBody
 * @returns string with coffee name or null if none could be determined
 */
function determineCoffeeFromMessage(messageBody, forEvent) {
  const possibleOptions = config(forEvent).spellingMap;
  const availableOptions = config(forEvent).availableMenu;
  const message = messageBody.trim().toLowerCase();

  // add availableOptions to possibleOptions to avoid missing entries:
  Object.keys(availableOptions).forEach(name => {
    possibleOptions[name.toLowerCase()] = name;
  });

  const optionsSortedByLength = Object.keys(possibleOptions).sort(
    sortByLengthDesc
  );

  /* eslint-disable no-restricted-syntax */
  for (const option of optionsSortedByLength) {
    const actualPick = possibleOptions[option];
    if (message.indexOf(option) !== -1 && availableOptions[actualPick]) {
      return actualPick;
    }
  }
  /* eslint-enable no-restricted-syntax */

  return null;
}

module.exports = {
  determineCoffeeFromMessage,
};
