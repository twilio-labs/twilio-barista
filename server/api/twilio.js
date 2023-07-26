const twilio = require('twilio');
const urljoin = require('url-join');
const kebabCase = require('lodash.kebabcase');

const { AccessToken } = twilio.jwt;
const { SyncGrant } = AccessToken;

const {
  TWILIO_API_KEY,
  TWILIO_API_SECRET,
  TWILIO_ACCOUNT_SID,
  TWILIO_CONVERSATIONS_SERVICE,
  TWILIO_SYNC_SERVICE,
  TWILIO_MESSAGING_SERVICE,
} = process.env;

const {
  SYNC_NAMES,
  DEFAULT_CONFIGURATION,
  DEFAULT_EVENT_CONFIGURATION,
  TAGS,
} = require('../../shared/consts');

const restClient = twilio(TWILIO_API_KEY, TWILIO_API_SECRET, {
  accountSid: TWILIO_ACCOUNT_SID,
});

const syncClient = restClient.sync.services(TWILIO_SYNC_SERVICE);
const conversationsClient = restClient.conversations.v1; // TODO remove or maybe not (TWILIO_CONVERSATIONS_SERVICE);
const messagingClient = restClient.messaging.services(TWILIO_MESSAGING_SERVICE);

const orderQueueList = eventId =>
  syncClient.syncLists(SYNC_NAMES.ORDER_QUEUE + eventId);
const configurationDoc = syncClient.documents(SYNC_NAMES.CONFIGURATION);
const customersMap = syncClient.syncMaps(SYNC_NAMES.CUSTOMERS);
const metricsMap = syncClient.syncMaps(SYNC_NAMES.METRICS);
const allOrdersList = eventId =>
  syncClient.syncLists(SYNC_NAMES.ALL_ORDERS + eventId);

// async function registerAddress(address, bindingType) { TODO Remove
//   const identity = getIdentityFromAddress(address);
//   const endpoint = `${identity}:${bindingType}`;
//   const tag = [TAGS.INTERACTED];
//   const { sid } = await notifyClient.bindings.create({
//     identity,
//     address,
//     endpoint,
//     bindingType,
//     tag,
//   });
//   return { identity, sid };
// }

async function sendMessage(conversationSID, msg) {
  return conversationsClient.conversations(conversationSID).messages.create({
    author: 'system',
    ...msg
  });
}

// async function sendMessageToAll(body) { TODO remove where this is callend
//   const notification = await notifyClient.notifications.create({
//     tag: TAGS.ALL,
//     body,
//   });
//   return notification;
// }

// async function sendMessageToAllForEvent(body, eventId) {  TODO remove where this is callend
//   const notification = await notifyClient.notifications.create({
//     tag: TAGS.PREFIX_EVENT + eventId,
//     body,
//   });
//   return notification;
// }

// async function registerTagForBinding(bindingSid, tag) {  TODO remove where this is callend
//   const originalBinding = await notifyClient.bindings(bindingSid).fetch();
//   const newBindingData = {
//     identity: originalBinding.identity,
//     address: originalBinding.address,
//     endpoint: originalBinding.endpoint,
//     bindingType: originalBinding.bindingType,
//   };
//   newBindingData.tag = [
//     ...(originalBinding.tags || []).filter(t => t !== tag),
//     tag,
//   ];
//   const { sid } = await notifyClient.bindings.create(newBindingData);
//   return sid;
// }

// async function removeTagForBinding(bindingSid, tagToRemove) {  TODO remove where this is callend
//   const originalBinding = await notifyClient.bindings(bindingSid).fetch();
//   const newBindingData = {
//     identity: originalBinding.identity,
//     address: originalBinding.address,
//     endpoint: originalBinding.endpoint,
//     bindingType: originalBinding.bindingType,
//   };
//   newBindingData.tag = (originalBinding.tags || []).filter(
//     tag => tag !== tagToRemove
//   );
//   const { sid } = await notifyClient.bindings.create(newBindingData);
//   return sid;
// }

// async function removeTagsForBindingWithPrefix(bindingSid, tagPrefix) {  TODO remove where this is callend
//   const originalBinding = await notifyClient.bindings(bindingSid).fetch();
//   const newBindingData = {
//     identity: originalBinding.identity,
//     address: originalBinding.address,
//     endpoint: originalBinding.endpoint,
//     bindingType: originalBinding.bindingType,
//   };
//   newBindingData.tag = (originalBinding.tags || []).filter(
//     tag => !tag.startsWith(tagPrefix)
//   );
//   const { sid } = await notifyClient.bindings.create(newBindingData);
//   return sid;
// }

// async function registerOpenOrder(bindingSid) {  TODO remove where this is callend
//   return registerTagForBinding(bindingSid, TAGS.OPEN_ORDER);
// }

// async function deregisterOpenOrder(bindingSid) {  TODO remove where this is callend
//   return removeTagForBinding(bindingSid, TAGS.OPEN_ORDER);
// }

// async function sendMessageToAllOpenOrders(body) {  TODO remove where this is callend
//   const notification = await notifyClient.notifications.create({
//     tag: TAGS.OPEN_ORDER,
//     body,
//   });
//   return notification;
// }

// async function sendMessageToAllOpenOrdersForEvent(body, eventId) {  TODO remove where this is callend
//   const notification = await notifyClient.notification.create({
//     tag: TAGS.PREFIX_EVENT + eventId,
//     body,
//   });
//   return notification;
// }

async function setup(baseUrl) {
  await configureWebhookUrls(baseUrl);
  await createResources();
  return setPermissions();
}

async function configureWebhookUrls(baseUrl) {
  // await messagingClient.update({ //TODO need to be changed to update conversation service
  //   friendlyName: 'Twilio Barista',
  //   inboundRequestUrl: urljoin(baseUrl, '/api/webhook/incoming'),
  // });
  await syncClient.update({
    webhookUrl: urljoin(baseUrl, '/api/webhook/sync'), //TODO this is very error prone when running from localhost / ngrok
  });
  return true;
}

async function loadConnectedPhoneNumbers() {
  const phoneNumbers = await messagingClient.phoneNumbers.list(); //TODO fetch WhatsApp bindings as well
  const connectedPhoneNumbers = phoneNumbers.map(p => p.phoneNumber).join(', ');
  return connectedPhoneNumbers;
}

function createToken(user) {
  const syncGrant = new SyncGrant({
    serviceSid: TWILIO_SYNC_SERVICE,
  });

  const token = new AccessToken(
    TWILIO_ACCOUNT_SID,
    TWILIO_API_KEY,
    TWILIO_API_SECRET
  );
  token.addGrant(syncGrant);
  token.identity = user;
  return token.toJwt();
}

async function setOrderQueuePermission(orderQueueName) {
  const updateOrderQueuePermissions = syncClient
    .syncLists(orderQueueName)
    .syncListPermissions('barista')
    .update({ read: 'true', write: 'true', manage: 'false' });

  const updateOrderQueuePermissionsForAdmin = syncClient
    .syncLists(orderQueueName)
    .syncListPermissions('admin')
    .update({ read: 'true', write: 'true', manage: 'false' });

  return Promise.all([
    updateOrderQueuePermissions,
    updateOrderQueuePermissionsForAdmin,
  ]);
}

async function setAllOrdersListPermission(allOrdersListName) {
  const updateAllOrdersPermissionsForAdmin = syncClient
    .syncLists(allOrdersListName)
    .syncListPermissions('admin')
    .update({ read: 'true', write: 'true', manage: 'false' });

  const updateAllOrdersPermissionsForBarista = syncClient
    .syncLists(allOrdersListName)
    .syncListPermissions('barista')
    .update({ read: 'true', write: 'false', manage: 'false' });

  const updateAllOrdersPermissionsForDashboard = syncClient
    .syncLists(allOrdersListName)
    .syncListPermissions('dashboard')
    .update({ read: 'true', write: 'false', manage: 'false' });

  return Promise.all([
    updateAllOrdersPermissionsForAdmin,
    updateAllOrdersPermissionsForBarista,
    updateAllOrdersPermissionsForDashboard,
  ]);
}

async function setConfigurationPermissions(configName) {
  const updateConfigurationPermissionsForAdmin = syncClient
    .documents(configName)
    .documentPermissions('admin')
    .update({ read: 'true', write: 'true', manage: 'false' });

  return Promise.all([updateConfigurationPermissionsForAdmin]);
}

async function setPermissions() {
  const updateConfigurationPermissionsForAdmin = syncClient
    .documents(SYNC_NAMES.CONFIGURATION)
    .documentPermissions('admin')
    .update({
      read: 'true',
      write: 'true',
      manage: 'false',
    });

  const updateCustomerPermissionsForAdmin = syncClient
    .syncMaps(SYNC_NAMES.CUSTOMERS)
    .syncMapPermissions('admin')
    .update({
      read: 'true',
      write: 'true',
      manage: 'false',
    });

  return Promise.all([
    updateConfigurationPermissionsForAdmin,
    updateCustomerPermissionsForAdmin,
  ]);
}

const createConfigurationDoc = function () {
  return createIfNotExists(
    syncClient.documents,
    SYNC_NAMES.CONFIGURATION,
    DEFAULT_CONFIGURATION
  );
};

async function createOrderQueue(eventId) {
  const name = SYNC_NAMES.ORDER_QUEUE + eventId;
  return resetList(name);
}

const createCustomerMap = function () {
  return createIfNotExists(syncClient.syncMaps, SYNC_NAMES.CUSTOMERS);
};

const createMetricsMap = function () {
  return createIfNotExists(syncClient.syncMaps, SYNC_NAMES.METRICS);
};

async function createAllOrdersList(eventId) {
  const name = SYNC_NAMES.ALL_ORDERS + eventId;
  return resetList(name);
}

async function createResources() {
  return Promise.all([
    createConfigurationDoc(),
    createCustomerMap(),
    createMetricsMap(),
  ]);
}

async function createIfNotExists(resource, name, data) {
  const argument = {
    uniqueName: name,
  };
  if (data) {
    argument.data = data;
  }
  try {
    return await resource(name).fetch();
  } catch (err) {
    return resource.create(argument);
  }
}

async function removeDocument(docName) {
  return syncClient.documents(docName).remove();
}

async function removeAllEventConfigDocs() {
  const configNames = (await syncClient.documents.list())
    .map(doc => doc.uniqueName)
    .filter(name => name.startsWith(SYNC_NAMES.EVENT_CONFIG));

  return Promise.all(configNames.map(removeDocument));
}

async function removeList(listName) {
  return syncClient.syncLists(listName).remove();
}

async function resetAllLists(baseName) {
  const listNames = (await syncClient.syncLists.list())
    .map(list => list.uniqueName)
    .filter(name => name.startsWith(baseName));
  const listPromises = listNames.map(removeList);
  return Promise.all(listPromises);
}

async function resetList(name) {
  try {
    await syncClient.syncLists(name).remove();
  } catch (err) {
    // noop
  }
  await createIfNotExists(syncClient.syncLists, name);
  if (name.startsWith(SYNC_NAMES.ORDER_QUEUE)) {
    setOrderQueuePermission(name);
  } else if (name.startsWith(SYNC_NAMES.ALL_ORDERS)) {
    setAllOrdersListPermission(name);
  }
  return true;
}

async function resetMap(name) {
  await syncClient.syncMaps(name).remove();
  await createIfNotExists(syncClient.syncMaps, name);
}

// async function resetNotify() { //TODO need an replacement? is there a reset for conversations?
//   const bindings = await notifyClient.bindings.list();
//   const deleteBindings = bindings.map(async ({ sid }) =>
//     notifyClient.bindings(sid).remove()
//   );
//   return Promise.all(deleteBindings);
// }

function getEventConfigName(slug) {
  return SYNC_NAMES.EVENT_CONFIG + slug;
}

async function createEventConfiguration(eventName, customData) {
  const slug = kebabCase(eventName);
  const data = Object.assign(
    {},
    DEFAULT_EVENT_CONFIGURATION,
    {
      eventName,
      slug,
    },
    customData
  );
  const name = getEventConfigName(slug);
  const createResult = await createIfNotExists(
    syncClient.documents,
    name,
    data
  );
  await setConfigurationPermissions(name);
  return createResult;
}

async function listAllEvents() {
  const documents = await syncClient.documents.list();
  const events = documents
    .map(d => d.uniqueName)
    .filter(name => name.indexOf(SYNC_NAMES.EVENT_CONFIG) === 0);
  return events;
}

async function fetchEventConfigurations() {
  const events = await listAllEvents();
  const eventDataPromises = events.map(async name => {
    const { data } = await syncClient.documents(name).fetch();
    return data;
  });
  return Promise.all(eventDataPromises);
}

function getEventConfigDoc(slug) {
  return syncClient.documents(getEventConfigName(slug));
}

module.exports = {
  SYNC_NAMES,
  restClient,
  conversationsClient,
  syncClient,
  sendMessage,
  // registerAddress,
  messagingClient,
  orderQueueList,
  configurationDoc,
  customersMap,
  metricsMap,
  allOrdersList,
  setup,
  createToken,
  createConfigurationDoc,
  loadConnectedPhoneNumbers,
  // sendMessageToAll,
  // sendMessageToAllForEvent,
  // sendMessageToAllOpenOrders,
  // sendMessageToAllOpenOrdersForEvent,
  // registerOpenOrder,
  // deregisterOpenOrder,
  resetList,
  setPermissions,
  resetMap,
  // resetNotify,
  fetchEventConfigurations,
  getEventConfigDoc,
  createEventConfiguration,
  listAllEvents,
  resetAllLists,
  createAllOrdersList,
  createOrderQueue,
  // registerTagForBinding,
  // removeTagForBinding,
  // removeTagsForBindingWithPrefix,
  removeAllEventConfigDocs,
};
