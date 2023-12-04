const twilio = require('twilio');
const urljoin = require('url-join');
const kebabCase = require('lodash.kebabcase');
const PromiseThrottle = require('promise-throttle');

const { AccessToken } = twilio.jwt;
const { SyncGrant } = AccessToken;

function createBooleanMapOfArray(array) {
  return array.reduce((map, entry) => ({ ...map, [entry.shortTitle]: true }), {});
}

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
  AVAILABLE_BARISTA_OPTIONS,
  AVAILABLE_SMOOTHIE_OPTIONS
} = require('../../shared/consts');

const restClient = twilio(TWILIO_API_KEY, TWILIO_API_SECRET, {
  accountSid: TWILIO_ACCOUNT_SID,
});

const syncClient = restClient.sync.services(TWILIO_SYNC_SERVICE);
const conversationsClient = restClient.conversations.v1.services(TWILIO_CONVERSATIONS_SERVICE);
const conversationDefaultClient = restClient.conversations.v1;
const messagingClient = restClient.messaging.services(TWILIO_MESSAGING_SERVICE);

const orderQueueList = eventId =>
  syncClient.syncLists(SYNC_NAMES.ORDER_QUEUE + eventId);
const configurationDoc = syncClient.documents(SYNC_NAMES.CONFIGURATION);
const customersMap = syncClient.syncMaps(SYNC_NAMES.CUSTOMERS);
const metricsMap = syncClient.syncMaps(SYNC_NAMES.METRICS);
const allOrdersList = eventId =>
  syncClient.syncLists(SYNC_NAMES.ALL_ORDERS + eventId);

async function sendMessage(conversationSID, msg) {
  return conversationsClient.conversations(conversationSID).messages.create({
    author: 'system',
    ...msg
  });
}

async function sendMessageToAll(body) {
  const throttle = new PromiseThrottle({
    requestsPerSecond: 100,
    promiseImplementation: Promise,
  });
  const customers = await customersMap.syncMapItems.list();

  return Promise.all(customers.map(customer => {
    return throttle.add(sendMessage.bind(this, customer.key, { body }))
  }));
}

async function sendMessageToAllForEvent(body, eventId) {
  const throttle = new PromiseThrottle({
    requestsPerSecond: 100,
    promiseImplementation: Promise,
  });
  const customersAtEvent = (await customersMap.syncMapItems.list()).filter(
    ({ data }) => data.eventId === eventId
  );

  return Promise.all(customersAtEvent.map(customer => {
    return throttle.add(sendMessage.bind(this, customer.key, { body }))
  }));
}

async function sendMessageToAllOpenOrders(body) {
  const throttle = new PromiseThrottle({
    requestsPerSecond: 100,
    promiseImplementation: Promise,
  });
  const customersWithOpenOrders = (await customersMap.syncMapItems.list()).filter(
    ({ data }) => data.openOrders.length > 0
  );

  return Promise.all(customersWithOpenOrders.map(customer => {
    return throttle.add(sendMessage.bind(this, customer.key, { body }))
  }));
}

async function sendMessageToAllOpenOrdersForEvent(body, eventId) {
  const throttle = new PromiseThrottle({
    requestsPerSecond: 100,
    promiseImplementation: Promise,
  });
  const customersAtEventWithOpenOrders = (await customersMap.syncMapItems.list()).filter(
    ({ data }) => data.eventId === eventId && data.openOrders.length > 0
  );

  return Promise.all(customersAtEventWithOpenOrders.map(customer => {
    return throttle.add(sendMessage.bind(this, customer.key, { body }))
  }));
}

async function setup(baseUrl) {
  await linkConversationService();
  await configureWebhookUrls(baseUrl);
  await createResources();
  await setPermissions();
}

async function linkConversationService(baserl) {
  const defaultConfig = await conversationDefaultClient.configuration();
  await defaultConfig.update({
    defaultMessagingServiceSid: TWILIO_MESSAGING_SERVICE,
    defaultChatServiceSid: TWILIO_CONVERSATIONS_SERVICE
  })
}

async function configureWebhookUrls(baseUrl) {

  if (baseUrl.indexOf("localhost") >= 0) {
    throw new Error("Can't set sync callback URL to localhost, please use another domain.");
  }

  const conversationConfigFetched = await conversationsClient.fetch();
  await conversationConfigFetched.configuration().webhooks().update({
    filters: ['onMessageAdded'],
    postWebhookUrl: urljoin(baseUrl, '/api/webhook/incoming'),
    method: 'POST'
  })

  await syncClient.update({
    webhookUrl: urljoin(baseUrl, '/api/webhook/sync')
  });
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

async function resetConversations() {
  const conversations = await conversationsClient.conversations.list();

  Promise.all(conversations.map(async (conversation) =>
    await conversation.remove()
  ));
}

function getEventConfigName(slug) {
  return SYNC_NAMES.EVENT_CONFIG + slug;
}

async function createEventConfiguration(eventName, mode, customData) {
  const slug = kebabCase(eventName);
  const data = Object.assign(
    {},
    DEFAULT_EVENT_CONFIGURATION,
    {
      availableMenu: createBooleanMapOfArray(mode === "smoothie" ? AVAILABLE_SMOOTHIE_OPTIONS : AVAILABLE_BARISTA_OPTIONS),
      fullMenu: mode === "smoothie" ? AVAILABLE_SMOOTHIE_OPTIONS : AVAILABLE_BARISTA_OPTIONS,
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
  messagingClient,
  orderQueueList,
  configurationDoc,
  customersMap,
  metricsMap,
  allOrdersList,
  setup,
  createToken,
  createConfigurationDoc,
  sendMessageToAll,
  sendMessageToAllForEvent,
  sendMessageToAllOpenOrders,
  sendMessageToAllOpenOrdersForEvent,
  resetList,
  setPermissions,
  resetMap,
  resetConversations,
  fetchEventConfigurations,
  getEventConfigDoc,
  createEventConfiguration,
  listAllEvents,
  resetAllLists,
  createAllOrdersList,
  createOrderQueue,
  removeAllEventConfigDocs,
};
