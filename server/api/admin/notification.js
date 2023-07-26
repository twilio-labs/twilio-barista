const {
  sendMessage,
  sendMessageToAll,
  sendMessageToAllForEvent,
  sendMessageToAllOpenOrders,
  sendMessageToAllOpenOrdersForEvent,
} = require('../twilio');

//TODO remove all?

async function requestHandler(req, res) {
  const { sendTo, message, identity, eventId } = req.body; 
  try {
    let notification;
    if (sendTo === 'all') {
      notification = await sendMessageToAll(message);
    } else if (sendTo === 'activeOrders') {
      notification = await sendMessageToAllOpenOrders(message);
    } else if (sendTo === 'individual') {
      notification = await sendMessage(identity, message);
    } else if (sendTo === 'allForEvent') {
      if (!eventId) {
        res.status(400).send('Missing event ID');
        return;
      }
      notification = await sendMessageToAllForEvent(message, eventId);
    } else if (sendTo === 'activeOrdersForEvent') {
      if (!eventId) {
        res.status(400).send('Missing event ID');
        return;
      }
      notification = await sendMessageToAllOpenOrdersForEvent(message, eventId);
    }
    if (notification) {
      req.log.info(`Sent notification ${notification.sid}`);
      res.send({ sid: notification.sid });
    } else {
      res.send({});
    }
  } catch (err) {
    req.log.error(err);
    res.status(500).send(err.message);
  }
}

module.exports = { handler: requestHandler };
