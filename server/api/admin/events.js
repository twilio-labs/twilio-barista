const PromiseThrottle = require('promise-throttle');
const { safe } = require('../../utils/async-requests');
const {
  createEventConfig,
  deleteEventConfig,
  config,
} = require('../../data/config');
const {
  listAllEvents,
  createAllOrdersList,
  createOrderQueue,
  orderQueueList,
  allOrdersList,
  customersMap,
} = require('../twilio');
const { SYNC_NAMES } = require('../../../shared/consts');

async function handleCreateEventRequest(req, res, next) {
  const { eventName } = req.body;
  const data = await createEventConfig(eventName);
  const eventId = data.slug;
  await createOrderQueue(eventId);
  await createAllOrdersList(eventId);
  res.send({ eventId });
}

async function deleteAllBindingsAndCustomersForEvent(eventId) { //TODO need to check what;s needed
  // function deleteBinding(bindingSid) {
  //   return notifyClient
  //     .bindings(bindingSid)
  //     .remove()
  //     .catch(err => true);
  // }

  function deleteCustomer(customer) {
    return customer.remove().catch(err => true);
  }

  const throttle = new PromiseThrottle({
    requestsPerSecond: 100,
    promiseImplementation: Promise,
  });
  const customers = (await customersMap.syncMapItems.list()).filter(
    ({ data }) => data.eventId === eventId
  );

  // const promisesDeleteBindings = customers.map(({ data }) => {
  //   return throttle.add(deleteBinding.bind(this, data.bindingSid));
  // });
  const promisesDeleteCustomers = customers.map(customer => {
    return throttle.add(deleteCustomer.bind(this, customer));
  });

  return Promise.all([...promisesDeleteBindings, ...promisesDeleteCustomers]);
}

async function handleDeleteEventRequest(req, res, next) {
  const { eventId } = req.params;
  if (!eventId) {
    res.status(404).send({ message: 'Could not find event' });
    return;
  }
  await deleteEventConfig(eventId);
  await allOrdersList(eventId).remove();
  await orderQueueList(eventId).remove();
  await deleteAllBindingsAndCustomersForEvent(eventId);
  res.send({ message: 'Event deleted' });
}

async function handleGetEventsRequest(req, res, next) {
  const eventList = await listAllEvents();

  let events = eventList.map(id => id.substr(SYNC_NAMES.EVENT_CONFIG.length));

  if (req.query.type === 'full') {
    events = events.map(eventId => {
      const { eventName, isVisible } = config(eventId);
      return { eventId, eventName, isVisible };
    });

    if (req.query.visible === 'true') {
      events = events.filter(({ isVisible }) => isVisible);
    }
    events = events.map(({ eventId, eventName }) => {
      return { eventId, eventName };
    });
  }
  res.send({ events });
}

module.exports = {
  get: safe(handleGetEventsRequest),
  create: safe(handleCreateEventRequest),
  delete: safe(handleDeleteEventRequest),
};
