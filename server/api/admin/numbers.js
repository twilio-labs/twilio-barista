const { restClient } = require('../twilio');

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
  get: getAllAvailableCountries
};
