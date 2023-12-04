# Data Structures

The following data structures are used in the application.

## Configuration

This is a [Twilio Sync Document] with the key `configuration` storing configuration data of the following structure:

```ts
type GlobalConfigurationData = {
  connectedPhoneNumbers: string[];
  spellingMap: {
    SomeSpelling: string;
  };
}
```

Changes in the document will trigger a [sync webhook] that will update the [config] on the server.

## Event Configuration

This is a [Twilio Sync Document] with the key prefix `event_` followed by the ID of your event storing configuration data of the following structure:

```ts
type GlobalConfigurationData = {
  isVisible: boolean;
  isOn: boolean;
  mode: 'barista' | 'bartender' | 'smoothie';
  visibleNumbers: string[];
  offlineMessage: string;
  availableMenu: {
    SomeBeverage: boolean;
  };
  menuDetails: string;
  orderPickupLocation: string;
  repoUrl: string;
  expectedOrders: numbers;
  maxOrdersPerCustomer: number;
}
```

Changes in the document will trigger a [sync webhook] that will update the [config] on the server.

## Order Queue

This is a [Twilio Sync List] with the key prefix `orderQueue_` storing entries of the following structure:

```ts
type OrderQueueListEntry = {
  product: string;
  message: string;
  source: string;
  status: 'open'|'ready'|'cancelled';
  customer: string;
}
```

These entries are being added through the [incoming webhook]. The status is changed in the front-end and will trigger the [sync webhook]. This will then cause a message being sent and the entry being removed from the list.

## Customers

This is a [Twilio Sync Map] with the key `customers` of all the customers that registered. The data has the format of:

```ts
type CustomerMapData = {
  identity: string;
  openOrders: string[];
  countryCode: string;
  contact: string;
  source: string;
  eventExpiryData: number;
  eventId: string;
}
```

The keys are generated as 'identity' based on the phone number. For details check the [identity file].

## All Orders

This is a [Twilio Sync List] with the key prefix `allOrders_` with entries of the following data structure:

```ts
type AllOrdersListEntry = {
  countryCode: string;
  product: string;
  message: string;
  source: string;
}
```

This data is simply used for statistics and is created in the [incoming webhook].

[Twilio Sync Document]: https://www.twilio.com/docs/api/sync/rest/documents
[Twilio Sync Map]: https://www.twilio.com/docs/api/sync/rest/maps
[Twilio Sync List]: https://www.twilio.com/docs/api/sync/rest/lists
[incoming webhook]: ../server/api/webhooks/incoming.js
[sync webhook]: ../server/api/webhooks/incoming.js
[config]: ../server/data/config.js
[identity file]: ../server/utils/identity.js