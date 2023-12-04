const axios = require('axios');

const { config } = require('../data/config');

let templates = [];

axios.get('https://content.twilio.com/v1/Content', {
  headers: {
    'Content-Type': 'application/json'
  },
  auth: {
    username: process.env.TWILIO_API_KEY,
    password: process.env.TWILIO_API_SECRET
  },
}).then(res => {
  templates = res.data.contents.filter(c => c.friendly_name.startsWith(process.env.CONTENT_PREFIXES));
}).catch(() => {
  console.error("Couldn't fetch templates.");
  process.exit(0)
})

function getWrongOrderMessage(originalMessage, availableOptions) {

  const variables = [originalMessage, ...availableOptions.map(o => [o.title, o.shortTitle, o.description]).flat()];
  const contentVariables = {};
  for (const key of variables.keys()) {
    contentVariables[key] = variables[key];
  }

  const templateName = `${process.env.CONTENT_PREFIXES}wrong_order_${availableOptions.length}`;
  const template = templates.find(t => t.friendly_name === templateName);

  return {
    contentSid: template.sid,
    contentVariables: JSON.stringify(contentVariables),
  };

}

function getExistingOrderMessage(product, orderNumber) {
  return {
    body: `We're still making you a ${product}. Check order #${orderNumber} with our staff if you think there's something wrong.`
  }
}

function getOrderCreatedMessage(product, orderNumber, forEvent) {
  const { repoUrl, mode } = config(forEvent);
  const dataPolicy = `\n\nWe only use your phone number to notify you about our ${mode.toLowerCase()} service and redact all the messages & phone numbers afterwards.`;
  return {
    body: `Thanks for ordering a *${product}* from the Twilio powered ${mode.toLowerCase()} bar. Your order number is *#${orderNumber}*. We'll text you back when it's ready. ${dataPolicy} In the meantime check out this repo ${repoUrl} if you want to see how we built this app. `,
  }
}

function getOrderCancelledMessage(product, orderNumber) {
  return {
    body: `Your ${product} order has been cancelled. Please check with our staff if you think something is wrong. Your order number was #${orderNumber}.`
  }
}

function getOrderReadyMessage(product, orderNumber, forEvent) {
  const orderPickupLocation = config(forEvent).orderPickupLocation
  return {
    body: `Your ${product} is ready. You can skip the queue and collect it at ${orderPickupLocation} right away, ask for order number #${orderNumber}.`
  }
}

function getSystemOfflineMessage(forEvent) {
  const { offlineMessage, mode } = config(forEvent);
  if (typeof offlineMessage === 'string' && offlineMessage.trim().length > 0) {
    return {
      body: offlineMessage
    };
  }
  return {
    body: `No more ${mode === "barista" ? "coffee" : "smoothies"} 😱\nSeems like we are out of  ${mode === "barista" ? "coffee" : "smoothies"} for today. Have a great day!`
  }
}

function getHelpMessage(forEvent, availableOptions) {
  const { mode } = config(forEvent);
  const beverage = mode === "smoothie" ? "smoothie" : "coffee";
  const variables = [beverage, ...availableOptions.map(o => [o.title, o.shortTitle, o.description]).flat()];
  const contentVariables = {};
  for (const key of variables.keys()) {
    contentVariables[key] = variables[key];
  }

  const templateName = `${process.env.CONTENT_PREFIXES}help_privacy_${availableOptions.length}`;
  const template = templates.find(t => t.friendly_name === templateName);

  return {
    contentSid: template.sid,
    contentVariables: JSON.stringify(contentVariables),
  };
}

function getNoOpenOrderMessage() {
  return {
    body: "Seems like you have no open order at the moment. Simply message us the name of the beverage you would like."
  }
}

function getQueuePositionMessage(queuePosition) {
  return {
    body: `There are currently ${queuePosition} orders before yours.`
  }
}

function getCancelOrderMessage(product, orderNumber) {
  return {
    body: `Your order #${orderNumber} for ${product} has been cancelled successfully.`
  }
}

function getOopsMessage(error) {
  return {
    body: `Oops something went wrong! Talk to someone from Twilio and see if they can help you.`
  }
}

function getPostRegistrationMessage(forEvent, availableOptions, maxNumberOrders) {
  const { mode } = config(forEvent);
  const beverage = mode === "smoothie" ? "smoothies" : "coffee";
  const variables = [beverage, maxNumberOrders, ...availableOptions.map(o => [o.title, o.shortTitle, o.description]).flat()];
  const contentVariables = {};
  for (const key of variables.keys()) {
    contentVariables[key] = variables[key];
  }

  const templateName = `${process.env.CONTENT_PREFIXES}post_registration_${availableOptions.length}`;
  const template = templates.find(t => t.friendly_name === templateName);

  return {
    contentSid: template.sid,
    contentVariables: JSON.stringify(contentVariables),
  };

}

function getMaxOrdersMessage() {
  return {
    body: "It seems like you've reached the maximum numbers of orders we allowed at this event. Sorry."
  }
}

function getEventRegistrationMessage(choices) {
  return {
    body: `Which event are you currently at? Please reply with the number of your event below. \n${choices.join('\n')}`
  }
}

function getNoActiveEventsMessage() {
  return {
    body: "Oh no! 😕 It seems like we are not serving at the moment. Please check back later 🙂"
  }
}

module.exports = {
  getWrongOrderMessage,
  getExistingOrderMessage,
  getOrderCreatedMessage,
  getOrderCancelledMessage,
  getOrderReadyMessage,
  getSystemOfflineMessage,
  getHelpMessage,
  getMaxOrdersMessage,
  getNoOpenOrderMessage,
  getQueuePositionMessage,
  getCancelOrderMessage,
  getOopsMessage,
  getPostRegistrationMessage,
  getEventRegistrationMessage,
  getNoActiveEventsMessage,
};
