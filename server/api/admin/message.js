const {
  sendMessageToAll,
  sendMessageToAllForEvent,
  sendMessageToAllOpenOrders,
  sendMessageToAllOpenOrdersForEvent,
} = require('../twilio');

async function requestHandler(req, res) {
  const { sendTo, message, eventId } = req.body;
  let messages;
  try {
    if (sendTo === 'all') {
      messages = await sendMessageToAll(message);
    } else if (sendTo === 'activeOrders') {
      messages = await sendMessageToAllOpenOrders(message);
    } else if (sendTo === 'allForEvent') {
      if (!eventId) {
        res.status(400).send('Missing event ID');
        return;
      }
      messages = await sendMessageToAllForEvent(message, eventId);
    } else if (sendTo === 'activeOrdersForEvent') {
      if (!eventId) {
        res.status(400).send('Missing event ID');
        return;
      }
      messages = await sendMessageToAllOpenOrdersForEvent(message, eventId);
    }
    if (messages) {
      req.log.info(`Sent messages ${messages.map(message => message.sid)}`);
      res.send(messages.map(message => message.sid));
    } else {
      res.send({});
    }
  } catch (err) {
    req.log.error(err);
    res.status(500).send(err.message);
  }
}

module.exports = { handler: requestHandler };
