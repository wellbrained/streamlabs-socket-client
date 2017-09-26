# Streamlabs Socket Client

An unofficial library for making interfacing with Streamlabs Sockets API a painless experience.

## Basic Setup

Once you've installed the library (see below), here's what you need to get started.


First off, you need a socket token.

You can find yours at https://streamlabs.com/dashboard#/apisettings under "API TOKENS" then "Your Socket API Token".
This token is bound to the account that you are logged in with. If you need to access the alerts of a streamer, ask them to provide you with a token from the above location.


Basic connection and follow listener:

```js
const StreamlabsSocketClient = require('streamlabs-socket-client');

const client = new StreamlabsSocketClient({
  token: 'your-token-here',
  emitTests: true // true if you want alerts triggered by the test buttons on the streamlabs dashboard to be emitted. default false.
});

client.on('follow', (data) => {
  console.log(data);
});

client.connect();
```

This will log relevant data every time someone follows you.

Example:
```json
{
  "name": "tehkHOP",
  "isTest": true,
  "_id": "1b937f94ced23282a8a53abe05f22a08",
  "for": "twitch_account"
}
```

## Installing

Note, we have 2 different builds for node.js and browser, due to issues with XMLHttpRequest and socket.io-client.
Solution coming soon™

### Node.js

Install with npm:

`npm install streamlabs-socket-client`

Include in Node:

```js
const StreamlabsSocketClient = require('streamlabs-socket-client');

const client = new StreamlabsSocketClient({
  ...
});
```

If you are using a module loader that supports commonjs, such as babel or included with typescript, you can use import statements:
```js
import StreamlabsSocketClient from 'streamlabs-socket-client';

const client = new StreamlabsSocketClient({
  ...
});
```

Note: this will not work with native ESM, such as ESM in Node.js v8.5.0 or Chrome 61.

### Browser (webpack supported)

You can include the .min.js file in a script tag and use it like so:

```html
<script src="streamlabs-socket-client.min.js"></script>
<script>
const client = new StreamlabsSocket.Client({
  ...
});
</script>
```

If you are using a module loader that supports commonjs, such as babel or webpack, you can use import statements:
```js
import StreamlabsSocketClient from 'streamlabs-socket-client/commonjs-browser';

const client = new StreamlabsSocketClient({
  ...
});
```

## The Nice Things StreamlabsSocketClient Provides

### NO DUPLICATE ALERTS!!!1!eleven!1

Ever noticed the socket repeats the same alert 2 or 3 times? Yep, it sucks. We've got you covered, we discard any alerts with ids we've already seen.

### Guaranteed isTest Property

The Streamlabs socket doesn't always provide the `isTest` property. Sure, you could do `!!isTest`, but StreamlabsSocketClient does that for you.

### Individual Alert Types

The first nice thing that you get with this library, is that you don't have to listen to an `event` event, and then do a switch statement on the type, you can just listen TO the individual types of alert you want.

E.g.
```js
client.on('follow', (data) => {
  ...
});

client.on('host', (data) => {
  ...
});
```

### No Message Array

The data is provided as one object, as opposed to an array of objects.
If the `message` array provided by Streamlabs contains more than one item, multiple alerts will be emitted by StreamlabsSocketClient for these so they can be handled individually.

### Consistent Types

Numbers such as donation amounts and months subscribed are provided as type `Number` as opposed to `String`. A formatted `String` is provided if you want to access to the formatted data.

E.g. a donation will include `amount` (Number), and `formattedAmount` (String), and resubscription will include `months` (Number) and `formattedMonths` (String).

Without the library, sometimes the Streamlabs socket will give `amount` as a number, and sometimes as a string. (This difference seems to occur between test donations (when they work) and real donations).
But we fix this up for you.

### Seperated Subscription and Resubscription

Instead of emitting just `subscription` for both subs and resubs, StreamlabsSocketClient will emit `subscription` and `resubscription` seperately.

## Client Config

Client config options are as described below:

```js
const client = new StreamlabsSocketClient({
  // Required - token from streamlabs dashboard
  token: '',

  // Default false - Whether or not to emit alerts fired from the test buttons (note these might not work anyway)
  emitAlerts: false,

  // Default [] - array of additional events to be passed up from the websocket to the client
  rawEvents: ['connect'], // When the websocket client emits 'connect', so will the StreamlabsSocketClient
});
```

## Events

Emitted events are:
follow, donation, subscription, resubscription, host, bits

If the Streamlabs websocket sends an `event` event, with a type property not recognized, it'll be emitted with the raw data anyway.

## Misc

### A Note on Testing Alerts

On the Streamlabs alert page, there is a button to test different alert types (follow, subscription, donation, host, bits).
At the time of writing (19th Sept 2017), only the follow, subscription, and bits buttons work. To test a donation, manually add a donation on the "My Donations" page. Attempting to test a host will emit an 'error' event (This won't cause problems).

If you want to get your hands dirty for testing a host, you could manually call `client.client.emit('event', data)` on the websocket client, using sample data from https://streamlabs.readme.io/v1.0/page/socket-api

(No, this isn't a typo, it is `client.client.emit('event', data)` not `client.emit('event', data)`)

Example:

```js
const client = new StreamlabsSocketClient({
  token: '', // token here
});

client.on('host', data => console.log(data));

client.client.emit('event', {
  type: 'host',
  message: [
    {
      name: 'h4r5h48002',
      viewers: '1',
      type: 'manual',
      _id: '74a0b93e736f1f14762111f8ae34bf42',
    },
  ],
  for: 'twitch_account',
});
```

This will emit an example alert up to the `on('host', ...)` listener.
