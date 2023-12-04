# API overview

The Node.js server exposes a set of API endpoints that are used as part of the functionality of the app. This is an overview of the endpoints:

| Route | HTTP Method | Purpose |
| ----- | ----------- | ------- |
| `/api` | `GET` | Just returns `API Alive!`. Does not do anything |
| `/api/token` | `GET` | Authenticates and returns an access token for Twilio Sync |
| `/api/debug` | `GET` | Returns a sort of "god mode" that allows you to inspect the whole data stored in the Twilio Sync structures |
| `/api/webhook/incoming` | `POST` | Triggers for incoming messages. Called from Twilio |
| `/api/webhook/sync` | `POST` | Triggers for changes in the sync service. Called from Twilio |
| `/api/admin/numbers` | `GET` | Returns a list of all the countries that are supported for SMS |
| `/api/admin/numbers` | `POST` | Acquires a new phone number for a specific country and links it with the Messaging Service |
| `/api/admin/message` | `POST` | Used to send messages to everyone, a group of people or a specific person |
| `/api/admin/reset` | `POST` | Used to reset either the open orders or the entire application |
| `/api/admin/setup` | `POST` | Configures the services and creates the respective Twilio Sync data structures |