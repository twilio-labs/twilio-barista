const EventEmitter = require('events');
const {
  configurationDoc,
  createConfigurationDoc,
  fetchEventConfigurations,
  getEventConfigDoc,
  createEventConfiguration,
} = require('../api/twilio');
const {
  DEFAULT_JSON_ENTRY_KEY,
  DEFAULT_CONFIGURATION,
} = require('../../shared/consts');

let internalGlobalConfig = {};
const eventConfigMap = new Map();
const configEvents = new EventEmitter();

async function updateGlobalConfigEntry(key, value) {
  const newConfig = Object.assign({}, internalGlobalConfig, { [key]: value });
  const { data } = await configurationDoc.update({ data: newConfig });
  setGlobalConfig(data);
  return data;
}

async function updateEventConfigEntry(event, key, value) {
  const currentEventConfig = eventConfigMap.get(event);
  const newConfig = Object.assign({}, currentEventConfig, { [key]: value });
  const { data } = await getEventConfigDoc(event).update({ data: newConfig });
  setEventConfig(data);
  return data;
}

async function loadConfig() {
  try {
    await createConfigurationDoc();
    const { data } = await configurationDoc.fetch();
    setGlobalConfig(data);
    const events = await fetchEventConfigurations();
    events.forEach(setEventConfig);
  } catch (err) {
    setGlobalConfig(DEFAULT_CONFIGURATION);
  }
  return config();
}

function config(event) {
  if (event) {
    return configForEvent(event);
  }

  return Object.assign({}, internalGlobalConfig, {
    events: allEventsAsObject(),
  });
}

function configForEvent(event) {
  const eventConfig = eventConfigMap.get(event);
  const config = Object.assign({}, internalGlobalConfig, eventConfig);
  return config;
}

function setGlobalConfig(conf) {
  for (const key of Object.keys(conf)) {
    const val = conf[key];
    if (typeof val === 'object' && !Array.isArray(val)) {
      delete val[''];
      delete val[DEFAULT_JSON_ENTRY_KEY];
    }
  }
  internalGlobalConfig = conf;
  configEvents.emit('updated', { config: conf });
}

function setEventConfig(data) {
  eventConfigMap.set(data.slug, data);
}

function allEventsAsObject() {
  const data = {};
  for (const [slug, conf] of eventConfigMap.entries()) {
    data[slug] = conf;
  }
  return data;
}

async function deleteEventConfig(event) {
  await getEventConfigDoc(event).remove();
  eventConfigMap.delete(event);
  return true;
}

function unsetAllEventConfigs() {
  eventConfigMap.clear();
}

async function createEventConfig(eventName, mode) {
  const customData = {
    visibleNumbers: internalGlobalConfig.connectedPhoneNumbers,
  };
  const { data } = await createEventConfiguration(eventName,mode, customData);
  setEventConfig(data);
  return data;
}

module.exports = {
  DEFAULT_CONFIGURATION,
  config,
  setGlobalConfig,
  setEventConfig,
  configEvents,
  loadConfig,
  updateGlobalConfigEntry,
  createEventConfig,
  deleteEventConfig,
  unsetAllEventConfigs,
};
