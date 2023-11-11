const { MessagingResponse } = require('twilio').twiml;
const moment = require('moment');
const countriesList = require("countries-list")
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();


const { determineCoffeeFromMessage } = require('../../data/coffee-options');
const { config } = require('../../data/config');
const {
  getWrongOrderMessage,
  getExistingOrderMessage,
  getOrderCreatedMessage,
  getHelpMessage,
  getMaxOrdersMessage,
  getNoOpenOrderMessage,
  getQueuePositionMessage,
  getCancelOrderMessage,
  getSystemOfflineMessage,
  getEventRegistrationMessage,
  getNoActiveEventsMessage,
} = require('../../utils/messages');
const {
  customersMap,
  orderQueueList,
  allOrdersList,
  sendMessage,
} = require('../twilio');
const {
  INTENTS,
} = require('../../../shared/consts');

const { safe } = require('../../utils/async-requests.js');

const {
  X_VERCEL_PROTECTION_BYPASS,
  TWILIO_AI_ASSISTANT_ID
} = process.env;

function createOrderItem(customer, coffeeOrder, originalMessage) {
  return {
    data: {
      product: coffeeOrder,
      message: originalMessage,
      source: customer.data.source,
      status: 'open',
      customer: customer.key,
    },
  };
}

async function findOrCreateCustomer({ Author, Source, ConversationSid, MessagingServiceSid }) {
  let customerEntry;
  try {
    customerEntry = await customersMap.syncMapItems(ConversationSid).fetch();
  } catch (err) {
    const number = phoneUtil.parseAndKeepRawInput(Author.replace("whatsapp:", ""));
    const country = Object.values(countriesList.countries).find(country => country.phone === `${number.getCountryCode()}`)
    customerEntry = await customersMap.syncMapItems.create({
      key: ConversationSid,
      data: {
        openOrders: [],
        completedOrders: 0,
        contact: MessagingServiceSid,
        countryCode: country.name || 'unknown',
        source: Source,
        eventId: null,
      },
    });
  }
  return customerEntry;
}

async function setEventForCustomer(customerEntry, eventId) {
  const eventExpiryDate = moment()
    .add(5, 'days')
    .valueOf();
  const data = Object.assign({}, customerEntry.data, {
    eventId,
    eventExpiryDate,
  });
  return customerEntry.update({ data });
}

async function removeEventForCustomer(customerEntry) {
  const data = Object.assign({}, customerEntry.data);
  data.eventId = undefined;
  data.eventExpiryDate = undefined;
  return customerEntry.update({ data });
}

function determineIntent(message, forEvent) {
  const msgNormalized = message.toLowerCase().trim();
  if (msgNormalized.startsWith('_register:')) {
    const eventId = msgNormalized.replace('_register:', '').trim();
    return {
      intent: INTENTS.REGISTER,
      value: eventId,
    };
  }

  if (msgNormalized.startsWith('_unregister')) {
    return {
      intent: INTENTS.UNREGISTER,
    };
  }

  if (msgNormalized.startsWith('_eventinfo')) {
    return {
      intent: INTENTS.GET_EVENT,
    };
  }

  if (msgNormalized.indexOf('help') !== -1) {
    return {
      intent: INTENTS.HELP,
    };
  }

  if (msgNormalized.indexOf('send this message to order') !== -1) {
    return {
      intent: INTENTS.WELCOME,
    };
  }

  if (msgNormalized.indexOf('queue') !== -1) {
    return {
      intent: INTENTS.QUEUE,
    };
  }

  if (msgNormalized.indexOf('cancel') !== -1) {
    return {
      intent: INTENTS.CANCEL,
    };
  }

  const coffeeOrder = determineCoffeeFromMessage(message, forEvent);
  if (!coffeeOrder) {
    return {
      intent: INTENTS.INVALID,
    };
  }

  return {
    intent: INTENTS.ORDER,
    value: coffeeOrder,
  };
}

// TODO: Not currently possible to use as AI assistant tool w/ a DELETE
async function getOrderStatus(customer, eventId) {
  const orderNumber = customer.data.openOrders[0];
  if (!orderNumber) {
    return {};
  }
  const items = await orderQueueList(eventId).syncListItems.list({
    pageSize: 100,
  });
  const queuePosition = items.findIndex(item => item.index === orderNumber);
  return {
    queuePosition
  };
}

// TODO: Not currently possible to use as AI assistant tool w/ a DELETE
async function cancelOrder(customer, eventId) {
  const orderNumber = customer.data.openOrders[0];
  if (orderNumber === undefined) {
    return false;
  }
  const orderedItemLink = orderQueueList(eventId)
    .syncListItems(orderNumber);
  const orderedItem = await orderedItemLink.fetch()
  await orderedItemLink.remove();
  customer.data.openOrders = [];
  await customersMap.syncMapItems(key).update({
    data: customer.data,
  });
  return {
    product: orderedItem.data.product,
    orderNumber: orderNumber
  };
}

async function placeOrder(customer, eventId, order) {
  const {menuItem, specialRequests} = order;
  const orderEntry = await orderQueueList(eventId).syncListItems.create(
    createOrderItem(customer, menuItem, specialRequests)
  );
  customer.data.openOrders.push(orderEntry.index);
  await customersMap.syncMapItems(customer.key).update({
    data: customer.data,
  });

  await allOrdersList(eventId).syncListItems.create({
    data: {
      product: menuItem,
      message: specialRequests,
      source: customer.data.source,
      countryCode: customer.data.countryCode,
    }
  });
  return {
    orderNumber: orderEntry.index
  };
}

async function getAIResponse(sessionId, message) {
  const response = await fetch(`https://hack-assistant.twilionext.com/api/${TWILIO_AI_ASSISTANT_ID}/webhooks/rest`, {
    method: 'POST',
    body: JSON.stringify({
        Identity: 'NONE',
        SessionId: sessionId,
        // SessionId: customerEntry.key,
        Body: message
        // Body: req.body.Body
    }),
    headers: {
      'content-type': 'application/json',
      'x-vercel-protection-bypass': X_VERCEL_PROTECTION_BYPASS
    }
  })

  const results = await response.json();
  return results.body;
}

// Handle an incoming order: called from the AI assistant tool 'place-order'
async function handleOrderAction(req, res) {
  const ConversationSid = req.headers['x-session-id'].split(':').pop()
  let customerEntry = await findOrCreateCustomer({ConversationSid});
  let eventId = customerEntry.data.eventId;
  let responseBody;

  try {
    switch (req.method) {
      case 'GET':
        responseBody = await getOrderStatus(customerEntry, eventId);
        break;
      case 'DELETE':
        responseBody = await cancelOrder(customerEntry, eventId);
        break;
      case 'POST':
        responseBody = await placeOrder(customerEntry, eventId, req.body);
        break;
      default:
        throw new Error(`${req.method} is not supported`)
    }

    res.send(responseBody);

  } catch (err) {
    req.log.error(err);
    res.status(500).send();
  }
}


/**
 * This is the request handler for incoming SMS and WhatsApp messages by handling webhook request from Twilio.
 *
 * @param {any} req
 * @param {any} res
 * @returns
 */
async function handleIncomingMessages(req, res) {
  let customerEntry = await findOrCreateCustomer(req.body);

  if (
    !customerEntry.data.eventId ||
    customerEntry.data.eventExpiryDate < Date.now()
  ) {
    const { events } = config();
    const choices = Object.values(events)
      .filter(x => {
        return x.isVisible;
      })
      .map(x => x.eventName)
      .map((name, idx) => `${idx + 1}: ${name}`);
    const choiceToEventId = Object.keys(events).filter(
      x => events[x].isVisible
    );
    if (isNaN(+req.body.Body)) {
      if (choiceToEventId.length === 0) {
        await sendMessage(customerEntry.key, getNoActiveEventsMessage());
        return;
      } else if (choiceToEventId.length > 1) {
        const message = getEventRegistrationMessage(choices);
        await sendMessage(customerEntry.key, message);
        return;
      }
      const autoChosenEventId = choiceToEventId[0];
      customerEntry = await setEventForCustomer(
        customerEntry,
        autoChosenEventId
      );
    } else {
      res.type('text/plain');
      const choice = parseInt(req.body.Body.trim(), 10);
      const chosenEventId = choiceToEventId[choice - 1];
      if (!chosenEventId) {
        return await sendMessage(customerEntry.key, { body: '🤷‍♀️ You chose an invalid number for the event. 🤷‍♂️ Please try again.' });
      }
      customerEntry = await setEventForCustomer(customerEntry, chosenEventId);
      return await sendMessage(customerEntry.key, { body: 'The event has been set 🙂. What would you like to order?' });
    }
  }

  const { eventId } = customerEntry.data;
  if (!config(eventId).isOn) {
    await sendMessage(customerEntry.key, getSystemOfflineMessage(eventId));
    return;
  }

  if (config(eventId).useAI) {
    try {
      const responseMessage = await getAIResponse(customerEntry.key, req.body.Body)
      await sendMessage(customerEntry.key, { body: responseMessage })
    } catch (error) {
      // TODO: Could fall back to non-AI path here if AI fails
      await sendMessage(customerEntry.key, getOopsMessage(eventId))
      console.log('ERROR: ', error)
    }
    return;
  } else {
    const messageIntent = determineIntent(req.body.Body, eventId);

    if (messageIntent.intent === INTENTS.REGISTER) {
      customerEntry = await setEventForCustomer(
        customerEntry,
        messageIntent.value
      );
      await sendMessage(customerEntry.key, { body: `Registered for ${messageIntent.value}` });
      return;
    } else if (messageIntent.intent === INTENTS.UNREGISTER) {
      customerEntry = await removeEventForCustomer(customerEntry);
      await sendMessage(customerEntry.key, { body: `Unregistered from all events` });
      return;
    } else if (messageIntent.intent === INTENTS.GET_EVENT) {
      await sendMessage(customerEntry.key, { body: `You are registered for: ${eventId}` });
      return;
    }

    // Respond to HTTP request with empty Response object since we will use the REST API to respond to messages.
    const twiml = new MessagingResponse();
    res.type('text/xml').send(twiml.toString());

    if (messageIntent.intent !== INTENTS.ORDER) {
      const { fullMenu, availableMenu } = config(eventId);
      const filteredMenu = fullMenu.filter(item => availableMenu[item.shortTitle]);
      try {
        let responseMessage;
        if (messageIntent.intent === INTENTS.HELP || messageIntent.intent === INTENTS.WELCOME) {
          responseMessage = getHelpMessage(eventId, filteredMenu);
        } else if (messageIntent.intent === INTENTS.QUEUE) {
          const { queuePosition } = await getOrderStatus(customerEntry, eventId);
          if (Number.isNaN(queuePosition)) {
            responseMessage = getNoOpenOrderMessage();
          } else {
            responseMessage = getQueuePositionMessage(queuePosition);
          }
        } else if (messageIntent.intent === INTENTS.CANCEL) {
          const cancelled = await cancelOrder(customerEntry, eventId);
          if (cancelled) {
            responseMessage = getCancelOrderMessage(cancelled.product, cancelled.orderNumber);
          } else {
            responseMessage = getNoOpenOrderMessage();
          }
        } else {
          responseMessage = getWrongOrderMessage(req.body.Body, filteredMenu);
        }
        await sendMessage(customerEntry.key, responseMessage);
        res.send();
        return;
      } catch (err) {
        req.log.error(err);
        res.status(500).send();
        return;
      }
    }
    const coffeeOrder = messageIntent.value;

    const { openOrders, completedOrders } = customerEntry.data;
    if (completedOrders >= config(eventId).maxOrdersPerCustomer) {

      try {
        await sendMessage(customerEntry.key, getMaxOrdersMessage());
        return;
      } catch (err) {
        req.log.error(err);
        return;
      }
    }
    if (Array.isArray(openOrders) && openOrders.length > 0) {
      try {
        const order = await orderQueueList(eventId)
          .syncListItems(openOrders[0])
          .fetch();

        await sendMessage(customerEntry.key, getExistingOrderMessage(
          order.data.product,
          order.index
        ));
        return;
      } catch (err) {
        req.log.error(err);
        return;
      }
    }

    try {
      const { orderNumber } = await placeOrder(customerEntry, eventId, {
        menuItem: coffeeOrder, specialRequests: req.body.Body
      })
      await sendMessage(customerEntry.key, getOrderCreatedMessage(coffeeOrder, orderNumber, eventId));
      res.send();
    } catch (err) {
      req.log.error(err);
      res.status(500).send();
    }
  }
}

module.exports = {
  messageHandler: safe(handleIncomingMessages),
  orderHandler: safe(handleOrderAction)
};
