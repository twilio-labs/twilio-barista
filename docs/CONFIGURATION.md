# Configuration

## Dynamic global configuration

These values can be changed in the configuration document via the admin interface.

| Key                                 | Type       | Default Value                        | Description                                                                                              |
| ----------------------------------- | ---------- | ------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| `connectedPhoneNumbers`             | `string[]` | `[]`                                 | List of phone numbers connected to the messaging service. This gets populated when the server starts up. |
| `spellingMap`                       | `object`   | `SPELLING_MISTAKES` in [consts file] | This is the map that is used to determine the order from the incoming message                            |
| `spellingMap['Spelling of Coffee']` | `string`   |                                      | Maps to the string of a value in `availableMenu`                                                      |

## Dynamic configuration per event

| Key                                  | Type                      | Default Value                                | Description                                                                                                               |
| ------------------------------------ | ------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `isVisible`                          | `boolean`                 | `false`                                      | If this is set to `true` and more than one event is visible, the user will be prompted for which event they are ordering. |
| `isOnline`                           | `boolean`                 | `true`                                       | If set to `false` it will return offline messages for incoming messages and don't trigger the classical actions.          |
| `mode`                               | `'barista' | 'bartender' | 'smoothie'` | `'barista'`                                  | Allows you to change the appearance of the kiosk and dashboard view.                                                      |
| `visibleNumbers`                     | `string[]`                | `[]`                                         | List of phone numbers that should be shown on the dashboard and kiosk view.                                               |
| `offlineMessage`                     | `string`                  | `''`                                         | Allows to customize the offline message instead of using the default ones.                                                |
| `availableMenu`                   | `object`                  | This is a map of beverages available in the system.
| `menuDetails`                   | `string`                  | `""` | Any additional details about the menu that should be displayed on the kiosk (i.e. "Oat and almond milk available".                                                                         |
| `orderPickupLocation`                   | `object`                  | `the coffee stand`                        | A specific location where guests can pick up their coffee. Could be a booth number, or conference hall location.                                                                         |
| `availableMenu['Name of Coffee']` | `boolean`                 | `true`                                       | If set to `true` this coffee is available.                                                                                |
| `spellingMap`                        | `object`                  | `SPELLING_MISTAKES` in [consts file]         | This is the map that is used to determine the order from the incoming message                                             |
| `spellingMap['Spelling of Coffee']`  | `string`                  |                                              | Maps to the string of a value in `availableMenu`                                                                       |
| `repoUrl`                            | `string`                  | `https://github.com/dkundel/twilio-barista`  | The link the repo that should be sent in the response messages                                                            |
| `expectedOrders`                     | `number`                  | `300`                                        | Arbitrary number of coffee orders expected. This is used to determine how filled the cup in the dashboard should be.      |
`maxOrdersPerCustomer`                     | `number`                  | `4`                                        | Maximum numbers of orders allowed per customer.      |

## Static configuration

These values can be configured via environment variables.

| Environment Variable Name     | Description                                                                                                     |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `PORT`                        | Port that the server should be running on. Defaults to `3000`                                                   |
| `LOGINS`                      | Semicolon-separated list of users in the schema `username,password,role`. Roles available are admin and barista |
| `PHONE_NUMBER_HASHING_SECRET` | Secret that is being used to generate the identities of the users based on their phone numbers                  |
| `TWILIO_ACCOUNT_SID`          | Your Twilio Account SID. www.twilio.com/console                                                                 |
| `TWILIO_API_KEY`              | Your Twilio API Key. www.twilio.com/console/dev-tools/api-keys                                                  |
| `TWILIO_API_SECRET`           | Your Twilio API Key. www.twilio.com/console/dev-tools/api-keys                                                  |
| `TWILIO_MESSAGING_SERVICE`    | Your Twilio Message Service SID. www.twilio.com/console/sms/services                                            |
| `TWILIO_CONVERSATIONS_SERVICE`       | Your Twilio Conversations Service SID. www.twilio.com/console/conversations/services                                          |
| `TWILIO_SYNC_SERVICE`         | Your Twilio Sync Service SID. www.twilio.com/console/sync/services                                              |

[consts file]: ../shared/consts
