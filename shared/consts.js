
const SYNC_NAMES = {
  ORDER_QUEUE: "orderQueue_",
  CONFIGURATION: "configuration",
  EVENT_CONFIG: "event_",
  CUSTOMERS: "customers",
  ALL_ORDERS: "allOrders_",
  METRICS: "metrics"
};

const DEFAULT_JSON_ENTRY_KEY = "CHOOSE_KEY";

const INTENTS = {
  WELCOME: "welcome",
  HELP: "help",
  QUEUE: "queue",
  ORDER: "order",
  CANCEL: "cancel",
  INVALID: "invalid",
  UNREGISTER: "unregister",
  REGISTER: "register",
  GET_EVENT: "getEvent",
};

/**
 * These are all coffee options that can actually be ordered
 */
const AVAILABLE_BARISTA_OPTIONS = [
  {
    shortTitle: "Coffee",
    title: "Coffee",
    description: "Brewed coffee, black"
  }, {
    shortTitle: "Espresso",
    title: "Espresso",
    description: "Strong black coffee"
  }, {
    shortTitle: "Double Espresso",
    title: "Double Espresso",
    description: "Double shot of espresso"
  }, {
    shortTitle: "Flat White",
    title: "Flat White",
    description: "Espresso with velvety milk"
  }, {
    shortTitle: "Macchiato",
    title: "Macchiato",
    description: "Espresso \"stained\" with a splash of milk"
  }, {
    shortTitle: "Double Macchiato",
    title: "Double Macchiato",
    description: "Two shots of espresso marked with milk"
  }, {
    shortTitle: "Latte Macchiato",
    title: "Latte Macchiato",
    description: "Milk marked with espresso"
  }, {
    shortTitle: "Cappuccino",
    title: "Cappuccino",
    description: "Espresso with steamed milk"
  }, {
    shortTitle: "Espresso Macchiato",
    title: "Espresso Macchiato",
    description: "Espresso with a dash of milk"
  }, {
    shortTitle: "Americano",
    title: "Americano",
    description: "Espresso with hot water"
  }, {
    shortTitle: "Matcha",
    title: "Matcha",
    description: "Powder made from ground-up green tea leaves brewed into tea."
  }, {
    shortTitle: "Mocha",
    title: "Mocha",
    description: "Whisked powdered green tea"
  }, {
    shortTitle: "Chai",
    title: "Chai",
    description: "Spiced tea with milk"
  }
]
const AVAILABLE_SMOOTHIE_OPTIONS = [
  {
    title: "Colombia (Red like Twilio!)",
    shortTitle: "Colombia",
    description: "Strawberry, Pineapple, Apple, Sunflower Seeds 🍓🍍🍏🌻"
  },
  {
    title: "Aquamarine (Blue like SendGrid!)",
    shortTitle: "Aquamarine",
    description: "Pineapple, Banana, Coconut Milk, Dates, Flaxseed 🍍🍌🥥🌴"
  },
  {
    title: "Lambada (Green like Segment!)",
    shortTitle: "Lambada",
    description: "Orange, Mango, Banana, Passion Fruit, Flaxseed, Coconut Oil 🍊🥭🍌🥥"
  }
]


/**
 * This is a rudamentary solution to solve typos. All these
 * wrong spellings will map to an actual available coffee.
 */
const SPELLING_MISTAKES = {
  "expreso": "Espresso",
  "expresso": "Espresso",
  "espresso": "Espresso",
  "cappacino": "Cappuccino",
  "capacino": "Cappuccino",
  "cappocino": "Cappuccino",
  "capocino": "Cappuccino",
  "cappucino": "Cappuccino",
  "cappuccino": "Cappuccino",
  "capuccino": "Cappuccino",
  "capochino": "Cappuccino",
  "late": "Latte",
  "lattey": "Latte",
  "larte": "Latte",
  "lattee": "Latte",
  "latte": "Latte",
  "cafe late": "Latte",
  "caffeé latte": "Latte",
  "caffe latte": "Latte",
  "americano": "Americano",
  "white americano": "Americano",
  "caffeé": "Americano",
  "flat white": "Flat White",
  "flatwhite": "Flat White",
  "flat-white": "Flat White",
  "flatt white": "Flat White",
  "filter coffee": "Filter Coffee",
  "coffee": "Filter Coffee",
  "fliter coffee": "Filter Coffee",
  "hot chocolate": "Hot Chocolate",
  "chocolate": "Hot Chocolate",
  "cocolate": "Hot Chocolate",
};

const DEFAULT_CONFIGURATION = {
  connectedPhoneNumbers: [],
  spellingMap: SPELLING_MISTAKES,
};

const DEFAULT_EVENT_CONFIGURATION = {
  isOn: true,
  useAI: false,
  isVisible: false,
  mode: "barista",
  offlineMessage: "We are sorry but there are currently no beverages.",
  menuDetails: "",
  orderPickupLocation: "the Twilio stand",
  repoUrl: "https://twil.io/twilio-barista",
  expectedOrders: 300,
  maxOrdersPerCustomer: 2,
  visibleNumbers: [],
};

module.exports = {
  DEFAULT_CONFIGURATION,
  DEFAULT_EVENT_CONFIGURATION,
  DEFAULT_JSON_ENTRY_KEY,
  INTENTS,
  SPELLING_MISTAKES,
  SYNC_NAMES,
  AVAILABLE_BARISTA_OPTIONS,
  AVAILABLE_SMOOTHIE_OPTIONS
};
