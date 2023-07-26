const {
  restClient,
  messagingClient,
  // loadConnectedPhoneNumbers,
} = require('../twilio');
const { updateGlobalConfigEntry } = require('../../data/config');

// async function handleNumberAcquisition(req, res, next) {
//   const { code } = req.body;
//   if (!code) {
//     res.sendStatus(400);
//     return;
//   }

//   try {
//     const numbers = await restClient.availablePhoneNumbers(code).local.list({
//       smsEnabled: 'true',
//     });
//     if (numbers.length === 0) {
//       res.send({});
//       return;
//     }

//     const { phoneNumber } = numbers[0];
//     const { sid } = await restClient.incomingPhoneNumbers.create({
//       phoneNumber,
//     });
//     const resp = await messagingClient.phoneNumbers.create({
//       phoneNumberSid: sid,
//     });
//     // const connectedPhoneNumbers = await loadConnectedPhoneNumbers();
//     await updateGlobalConfigEntry(
//       'connectedPhoneNumbers',
//       connectedPhoneNumbers
//     );
//     res.send({ phoneNumber });
//   } catch (err) {
//     req.log.error(err);
//     res.sendStatus(500);
//   }
// }

async function getAllAvailableCountries(req, res, next) {
  try {
    const countriesList = await restClient.pricing.messaging.countries.list();
    const countries = countriesList.map(({ country, isoCountry }) => ({
      country,
      code: isoCountry,
    }));

    res.send({ countries });
  } catch (err) {
    req.log.error(err);
    res.sendStatus(500);
  }
}

module.exports = {
  get: getAllAvailableCountries,
  // post: handleNumberAcquisition,
};
