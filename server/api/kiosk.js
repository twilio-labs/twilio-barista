const { config } = require('../data/config');
const { restClient } = require('./twilio');
const emojiFlags = require('emoji-flags');

async function handler(req, res) {
  const { eventId } = req.query;
  const { visibleNumbers, mode, availableMenu, menuDetails } = config(eventId);
  const filteredNumbers = visibleNumbers.split(',').map(num => num.trim());

  try {
    const phoneNumbers = (await Promise.all(
      filteredNumbers.map(async number => {
        try {
          const sanitizedNumber = number.replace(/[^(\d|\w)]/g, '');
          const { countryCode } = await restClient.lookups
            .phoneNumbers(sanitizedNumber)
            .fetch();
          const { emoji } = emojiFlags.countryCode(countryCode);
          return {
            countryCode,
            phoneNumber: number,
            emoji,
          };
        } catch (err) {
          return undefined;
        }
      })
    )).filter(x => !!x);
    const menuItems = Object.keys(availableMenu);
    res.send({
      phoneNumbers,
      eventType: mode,
      menuItems,
      menuDetails
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).send('Failed to retrieve kiosk info');
  }
}

module.exports = {
  handler,
};
