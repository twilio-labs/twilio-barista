<p align="center">
  <img src="client/assets/icons/android-chrome-192x192.png">
  <h1 align="center">Twilio Barista</h1>
</p>

## About

Twilio Barista is an application that allows you to solve the problem of long queues at barista stands at events. Attendees can order their coffee via various Twilio-powered channels, baristas get all orders on a website that can be loaded via a tablet and once an order is done the attendee will be notified via the system to come and pick it up. No more queueing and efficient coffee ☕️ ordering! 🎉

If you want to learn more about how this has been built, check out the following blog posts:
- [Serving Coffee with Twilio Programmable SMS and React](https://www.twilio.com/blog/2018/03/serving-coffee-with-sms-and-react.html)
- [Building an Intelligent Coffee Order System with Twilio Autopilot](https://d-k.im/coffee-autopilot)

Different versions of this system have been used at events such as:

* [NDC Oslo](https://ndcoslo.com) 2016, 2017
* [CSSConf EU](https://2017.cssconf.eu/) && [JSConf EU](https://2017.jsconf.eu/) 2017

You can find previous versions or implementations in other languages here:

| [<img src="https://avatars2.githubusercontent.com/u/9141961?s=70&v=4" width="70px;"/><br /><sub>.NET</sub>](https://github.com/mplacona/TwilioBaristaApp) | [<img src="https://avatars3.githubusercontent.com/u/9950313?s=70&v=4" width="70px;"/><br /><sub>Node.js v1</sub>](https://github.com/dkundel/twilio-barista/tree/v1.0.0) | [<img src="https://avatars2.githubusercontent.com/u/210414?s=70&v=4" width="70px;"/><br /><sub>Ruby</sub>](https://github.com/mplacona/SMSCoffeeShop) | [<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/320px-React-icon.svg.png" height="70px;" /><br /><sub>"Lite" with React</sub>](https://github.com/dkundel/barista-lite) |
| :-------------------------------------------------------------------------------------------------------------------------------------------------------: | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :---------------------------------------------------------------------------------------------------------------------------------------------------: | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |


![Diagram](resources/barista-diagram.png)

More information on how it works is in the [documentation].

## Features

* Receive orders using [Twilio Messaging]
* Store orders and real-time synchronization them between back-end and front-end using [Twilio Sync]
* Easy dynamic application configuration using [Twilio Sync]
* Dynamic phone number acquisition/configuration using the [Twilio REST API]
* Managing message threads using [Twilio Conversations]
* Permission management based on [Twilio Sync]
* Top PWA support thanks to [Preact CLI] based front-end
* Easy way to reset the application from the admin interface
* Query for location in the queue as well as canceling the order as a user

### Channels

The current [Twilio Channels] are:

* [SMS][twilio sms]

## Setup

### Requirements

* [Node.js] version 9.8 or higher
* [npm]
* A Twilio account - [Sign up here](https://www.twilio.com/try-twilio)

### Twilio Configuration

#### 0. Know your Twilio Account SID

Retrieve your Twilio Account SID from the [Twilio Console].

#### 1. Generate a Twilio API Key and Secret

Go into the [Twilio Console] and [generate an API Key and Secret](https://www.twilio.com/console/dev-tools/api-keys). Make sure to store the information safely.

#### 2. Create a Messaging Service

Create a [Messaging Service in the Twilio Console](https://www.twilio.com/console/sms/services) and store the SID.

#### 3. Create a Conversations Service

Create a [Conversations Service in the Twilio Console](https://www.twilio.com/console/conversations/services) and choose your created Messaging Service as a Messaging Service. Make sure to store the SID.
TODO append

#### 4. Create a Sync Service

Create a [Sync Service in the Twilio Console](https://www.twilio.com/console/sync/services), check the "ACL Enabled" enabled box, and store the SID.

### Deploy via Heroku

Simply click the button below, add the respective configuration values.

Go afterwards in the `/admin` section and click the **Setup** button. This will configure everything for you and you are ready to add phone numbers for the service.

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

### Manual

#### 1. Clone project and install dependencies

```bash
git clone git@github.com:twilio-labs/twilio-barista.git
cd twilio-barista
npm install
```

#### 2. Configure environment variables

The following environment variables are necessary for Twilio Barista:

* `TWILIO_ACCOUNT_SID`
* `TWILIO_API_KEY`
* `TWILIO_API_SECRET`
* `TWILIO_MESSAGING_SERVICE`
* `TWILIO_SYNC_SERVICE`
* `TWILIO_CONVERSATIONS_SERVICE`
* `PHONE_NUMBER_HASHING_SECRET` - This will be used to generate internal identities based on the phone number
* `LOGINS` - Semi-colon separated list based on the following schema: `username,password,role`. Available roles are:
  * `barista` - Enables you to see all orders but nothing else
  * `admin` - Can see and write all data
* `PORT` - Optional. By default it will run on port `3000`

#### a) For development

Copy the `.env.example` file into a `.env` file. And set the respective values in the file.

#### b) For production

[Set the environment variables](https://www.twilio.com/blog/2017/01/how-to-set-environment-variables.html) based on your operating system or hosting provider.

#### 3. Initially build your front-end

After you cloned the project and installed the dependencies, you have to do an intial build of the front-end. Run the following command to do so:

```bash
npm run build
```

#### 4. Start up server

#### a) Automatic detection of environment

```bash
npm start
```

If `NODE_ENV` is set to `production` the server will automatically start in production mode else it will load the `.env` file for the variables using [node-env-run].

#### b) Explicit development mode

```bash
npm run start:dev
```

#### c) Explicit production mode

```bash
npm run start:prod
```

#### d) Start in watch mode for automatic reloading of front-end or back-end

```bash
npm run dev
```

#### 5. Setup application

Navigate to your deployment on an externally available URL. If you are hosting for testing on your localhost you should use [ngrok] to create a tunnel.

Authenticate with an admin user, go into the Admin section and under Other click the **Setup** button. This will configure the rest.

#### 6. Acquire phone numbers

Purchase a number and configure it in the Configuration section of your Admin part under `connectedPhoneNumbers`.

#### 7. Register the webhook in the Twilio Consol
Go to the [Twilio Console](https://console.twilio.com) and integrate the `[Domain]/api/webhook/incoming` endpoint to the messaging service you specified with the SID above. 

#### 8. You are ready for some ☕️ action!

You are all set. People can start sending in messages to those numbers and you will receive them in the order section of your interface.

## Project Structure

The project is split up into three sections on the top level. The `client` directory contains all front-end related code and has been bootstrapped with the [Preact CLI]. The `server` directory contains anything backend related and is powered by [Express]. The `shared` folder contains any code that is being used by both parts of the project.

There is also a `client-dist` directory that contains the latest stable build of the front-end with the `production` flag enabled.

You can find more information in the [documentation] of the project.

## Code of Conduct

Please be aware that this project has a [Code of Conduct](CODE_OF_CONDUCT.md). The tldr; is to just be excellent to each other ❤️

## Contributing

You are more than welcome to contribute to this project. The tests for this project are still missing so please properly test your changes manually in the mean time.

### Building front-end changes

To build changes for the front-end you can run the following command:

```bash
npm run build:preact
```

### Running the server in dev mode

If you are developing and you want to incrementally build the changes for development purposes you can start of the back-end and front-end with:

```bash
npm run dev
```

## Special Thanks To

A special thanks to all the awesome folks in the open source community and their great projects and especially the folks working on the following projects:

* [`preact`](https://github.com/developit/preact), [`preact-cli`](https://github.com/developit/preact-cli), [`preact-router`](https://github.com/developit/preact-router), [`preact-mdl`](https://github.com/developit/preact-mdl)
* [`express`](https://github.com/expressjs/express)
* [`lodash`](https://github.com/lodash/lodash)
* [`pino`](https://github.com/pinojs/pino), [`express-pino-logger`](https://github.com/pinojs/express-pino-logger), [`pino-colada`](https://github.com/lrlna/pino-colada)
* [`prettier`](https://github.com/prettier/prettier)
* [`webpack`](https://github.com/webpack/webpack)
* [`moment`](https://github.com/moment/moment/)
* many more 🙂

## Icons Used

* [Barista Icons by Oliver Pitsch](https://www.smashingmagazine.com/2016/03/freebie-barista-iconset-50-icons-eps-png-svg/)
* [Bar by BirVa Mehta from Noun Project](https://thenounproject.com/term/bar/1323725/)

## Contributors

Thanks goes to these wonderful people ([emoji key](https://github.com/kentcdodds/all-contributors#emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore -->
| [<img src="https://avatars3.githubusercontent.com/u/1505101?v=4" width="100px;" alt="Dominik Kundel"/><br /><sub><b>Dominik Kundel</b></sub>](https://dkundel.com)<br />[💻](https://github.com/dkundel/twilio-barista/commits?author=dkundel "Code") [🐛](https://github.com/dkundel/twilio-barista/issues?q=author%3Adkundel "Bug reports") [📖](https://github.com/dkundel/twilio-barista/commits?author=dkundel "Documentation") | [<img src="https://avatars3.githubusercontent.com/u/31462?v=4" width="100px;" alt="Phil Nash"/><br /><sub><b>Phil Nash</b></sub>](https://philna.sh)<br />[💻](https://github.com/dkundel/twilio-barista/commits?author=philnash "Code") [🐛](https://github.com/dkundel/twilio-barista/issues?q=author%3Aphilnash "Bug reports") | [<img src="https://avatars0.githubusercontent.com/u/3673341?v=4" width="100px;" alt="Kelley Robinson"/><br /><sub><b>Kelley Robinson</b></sub>](http://krobinson.me)<br />[💻](https://github.com/dkundel/twilio-barista/commits?author=robinske "Code") [🐛](https://github.com/dkundel/twilio-barista/issues?q=author%3Arobinske "Bug reports") | [<img src="https://avatars1.githubusercontent.com/u/1095289?v=4" width="100px;" alt="Devin Rader"/><br /><sub><b>Devin Rader</b></sub>](https://github.com/devinrader)<br />[🐛](https://github.com/dkundel/twilio-barista/issues?q=author%3Adevinrader "Bug reports") | [<img src="https://avatars1.githubusercontent.com/u/8932430?v=4" width="100px;" alt="Lizzie Siegle"/><br /><sub><b>Lizzie Siegle</b></sub>](https://elizabethsiegle.github.io)<br />[💻](https://github.com/dkundel/twilio-barista/commits?author=elizabethsiegle "Code") |
| :---: | :---: | :---: | :---: | :---: |
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/kentcdodds/all-contributors) specification. Contributions of any kind welcome!

## License

MIT © Dominik Kundel

[twilio console]: https://www.twilio.com/console
[twilio rest api]: https://www.twilio.com/docs/api/rest
[twilio messaging]: https://www.twilio.com/messaging
[twilio sms]: https://www.twilio.com/sms
[twilio conversations]: https://www.twilio.com/conversations
[twilio sync]: https://wwww.twilio.com/sync
[twilio channels]: https://www.twilio.com/channels
[preact cli]: https://github.com/developit/preact-cli
[node.js]: https://nodejs.org
[npm]: https://npmjs.com
[node-env-run]: https://github.com/dkundel/node-env-run
[ngrok]: https://ngrok.com/
[express]: http://expressjs.com/
[documentation]: docs/README.md
