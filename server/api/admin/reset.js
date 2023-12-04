const PromiseThrottle = require('promise-throttle');
const { DEFAULT_CONFIGURATION } = require('../../../shared/consts');
const { getOrderCancelledMessage } = require('../../utils/messages');
const {
  SYNC_NAMES,
  resetList,
  orderQueueList,
  setPermissions,
  sendMessage,
  customersMap,
  configurationDoc,
  resetMap,
  resetAllLists,
  resetConversations,
  removeAllEventConfigDocs,
  restClient,
} = require('../twilio');
const {
  updateGlobalConfigEntry,
  unsetAllEventConfigs,
  config,
} = require('../../data/config');

async function cancelOpenOrders(eventId) {
  const openOrders = await orderQueueList(eventId).syncListItems.list({
    pageSize: 1000,
  });
  const closeAllOpenOrders = openOrders.map(async order => {
    const customerId = order.data.customer;
    const { product } = order.data;
    const orderNumber = order.index;
    await sendMessage(customerId, getOrderCancelledMessage(product, orderNumber));
    const { data } = await customersMap.syncMapItems(customerId).fetch();
    data.openOrders = [];
    return customersMap.syncMapItems(customerId).update({ data });
  });
  await Promise.all(closeAllOpenOrders);
  await resetList(SYNC_NAMES.ORDER_QUEUE + eventId);
  return setPermissions();
}

async function deleteAllMessages() {
  function deleteMessage(message) {
    return message.remove().catch(err => true);
  }

  const throttle = new PromiseThrottle({
    requestsPerSecond: 100,
    promiseImplementation: Promise,
  });
  const { connectedPhoneNumbers } = config();
  const messages = (await restClient.messages.list()).filter(
    msg =>
      msg.messagingServiceSid === process.env.TWILIO_MESSAGING_SERVICE ||
      connectedPhoneNumbers.includes(msg.from) ||
      connectedPhoneNumbers.includes(msg.to)
  );
  const promises = messages.map(message =>
    throttle.add(deleteMessage.bind(this, message))
  );
  return Promise.all(promises);
}

async function resetApplication() {
  await resetAllLists(SYNC_NAMES.ORDER_QUEUE);
  await resetAllLists(SYNC_NAMES.ALL_ORDERS);
  await removeAllEventConfigDocs();
  unsetAllEventConfigs();
  await configurationDoc.update({ data: DEFAULT_CONFIGURATION });
  await updateGlobalConfigEntry('connectedPhoneNumbers', []);
  await resetMap(SYNC_NAMES.CUSTOMERS);
  await resetConversations(); 
  await deleteAllMessages();
  await setPermissions();
  return Promise.resolve();
}

async function resetStats(eventId) {
  return resetList(SYNC_NAMES.ALL_ORDERS + eventId);
}

async function handleResetRequest(req, res) {
  const { action, eventId } = req.query;
  if (action === 'openOrders') {
    if (!eventId) {
      res.status(400).send('Missing eventId');
      return;
    }

    try {
      await cancelOpenOrders(eventId);
      res.send();
    } catch (err) {
      req.log.error(err);
      res.sendStatus(500);
    }
  } else if (action === 'stats') {
    if (!eventId) {
      req.status(400).send('Missing eventId');
      return;
    }

    try {
      await resetStats(eventId);
      res.send();
    } catch (err) {
      req.log.error(err);
      res.sendStatus(500);
    }
  } else if (action === 'resetApplication') {
    try {
      await resetApplication();
      res.send();
    } catch (err) {
      req.log.error(err);
      res.sendStatus(500);
    }
  } else {
    res.sendStatus(400);
  }
}

module.exports = { handler: handleResetRequest };
