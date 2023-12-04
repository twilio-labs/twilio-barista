const moment = require('moment');
const uniqBy = require('lodash.uniqby');
const flat = require('flat');
const { fetchStats } = require('../stats');
const { restClient, metricsMap, customersMap } = require('../twilio');
const { config } = require('../../data/config');
const { safe } = require('../../utils/async-requests');

function verifyInputAsStrings(params) {
  for (const param of params) {
    if (typeof param !== 'string') {
      return false;
    }
  }
  return true;
}

async function handleRetrievingStats(req, res) {
  const { eventId } = req.params;
  const { startDate, endDate, cache } = req.query;
  if (!verifyInputAsStrings([eventId, startDate, endDate])) {
    res.status(400).send('Invalid request parameters');
    return;
  }

  if (cache === 'read') {
    const { data } = await metricsMap.syncMapItems(eventId).fetch();
    data.cached = true;
    res.send(data);
    return;
  }

  const stats = await fetchStats(eventId);
  const startDateParsed = moment(startDate, 'YYYY-MM-DD').toDate();
  const endDateParsed = moment(endDate, 'YYYY-MM-DD').toDate();
  const { connectedPhoneNumbers } = config(eventId);

  const messages = (await restClient.messages.list({
    pageSize: 2000,
    dateSentBefore: endDateParsed,
    dateSentAfter: startDateParsed,
  })).filter(
    ({ messagingServiceSid }) =>
      messagingServiceSid === process.env.TWILIO_MESSAGING_SERVICE
  );

  const customers = await customersMap.syncMapItems.list();
  const customersForEvent = customers.filter(
    ({ data }) => data.eventId === eventId
  );

  const customerMessages = messages.filter(
    ({ from }) => !connectedPhoneNumbers.includes(from)
  );
  const uniqueSenders = uniqBy(customerMessages, 'from');

  stats.totalMessages = messages.length;
  stats.incomingMessages = customerMessages.length;
  stats.totalUniqueSenders = uniqueSenders.length;
  stats.totalCustomers = customersForEvent.length;

  const finalStats = flat(stats);

  if (cache === 'write') {
    try {
      await metricsMap.syncMapItems(eventId).update({ data: finalStats });
    } catch (err) {
      await metricsMap.syncMapItems.create({
        key: eventId,
        data: finalStats,
      });
    }
  }
  res.send(finalStats);
}

module.exports = {
  get: safe(handleRetrievingStats),
};
