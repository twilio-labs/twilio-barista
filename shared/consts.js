function createBooleanMapOfArray(array) {
  return array.reduce((map, entry) => ({ ...map, [entry]: true }), {});
}

const SYNC_NAMES = {
  ORDER_QUEUE: 'orderQueue_',
  CONFIGURATION: 'configuration',
  EVENT_CONFIG: 'event_',
  CUSTOMERS: 'customers',
  ALL_ORDERS: 'allOrders_',
  METRICS: 'metrics'
};

const DEFAULT_JSON_ENTRY_KEY = 'CHOOSE_KEY';

const INTENTS = {
  WELCOME: 'welcome',
  HELP: 'help',
  QUEUE: 'queue',
  ORDER: 'order',
  CANCEL: 'cancel',
  INVALID: 'invalid',
  UNREGISTER: 'unregister',
  REGISTER: 'register',
  GET_EVENT: 'getEvent',
};

const COOKIES = {
  CUSTOMER_STATE: 'CustomerState',
  EVENT_MAPPING: 'EventMapping',
  ORIGINAL_MESSAGE: 'PreviousMessage',
};

const CUSTOMER_STATES = {
  SET: 'set-eventId',
};

/**
 * These are all coffee options that can actually be ordered
 */
const AVAILABLE_DEFAULT_OPTIONS = [
  'Twilio',
  'Colombia',
  'SendGrid',
  'Lambada',
  'Segment',
  'Smaragd'
];

/**
 * This is a rudamentary solution to solve typos. All these
 * wrong spellings will map to an actual available coffee.
 */
const SPELLING_MISTAKES = {
  expreso: 'Espresso',
  expresso: 'Espresso',
  espresso: 'Espresso',
  cappacino: 'Cappuccino',
  capacino: 'Cappuccino',
  cappocino: 'Cappuccino',
  capocino: 'Cappuccino',
  cappucino: 'Cappuccino',
  cappuccino: 'Cappuccino',
  capuccino: 'Cappuccino',
  capochino: 'Cappuccino',
  late: 'Latte',
  lattey: 'Latte',
  larte: 'Latte',
  lattee: 'Latte',
  latte: 'Latte',
  'cafe late': 'Latte',
  'caffeé latte': 'Latte',
  'caffe latte': 'Latte',
  americano: 'Americano',
  'white americano': 'Americano',
  caffeé: 'Americano',
  'flat white': 'Flat White',
  flatwhite: 'Flat White',
  'flat-white': 'Flat White',
  'flatt white': 'Flat White',
  'filter coffee': 'Filter Coffee',
  coffee: 'Filter Coffee',
  'fliter coffee': 'Filter Coffee',
  'hot chocolate': 'Hot Chocolate',
  chocolate: 'Hot Chocolate',
  cocolate: 'Hot Chocolate',
  twilio: 'Colombia',
  sendgrid: 'Lambada',
  segment: 'Smaragd',
};

const DEFAULT_CONFIGURATION = {
  connectedPhoneNumbers: [],
  spellingMap: SPELLING_MISTAKES,
};

const DEFAULT_EVENT_CONFIGURATION = {
  isOn: true,
  isVisible: false,
  mode: 'smoothie',
  offlineMessage: 'We are sorry but there are currently no smoothies.',
  availableCoffees: createBooleanMapOfArray(AVAILABLE_DEFAULT_OPTIONS),
  menuDetails: '',
  orderPickupLocation: 'the Twilio stand',
  repoUrl: 'https://twil.io/twilio-smoothies',
  expectedOrders: 300,
  maxOrdersPerCustomer: 2,
  visibleNumbers: [],
};

module.exports = {
  AVAILABLE_DEFAULT_OPTIONS,
  DEFAULT_CONFIGURATION,
  DEFAULT_EVENT_CONFIGURATION,
  DEFAULT_JSON_ENTRY_KEY,
  INTENTS,
  SPELLING_MISTAKES,
  SYNC_NAMES,
  COOKIES,
  CUSTOMER_STATES,
};
