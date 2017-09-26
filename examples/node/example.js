const { readFileSync } = require('fs');
const StreamlabsSocketClient = require('../../');

const token = readFileSync(`${__dirname}/token`).toString().trim();

const rawEvents = [
  'connect',
  'connect_error',
  'connect_timeout',
  'disconnect',
  'error',
  'event',
];

const client = new StreamlabsSocketClient({
  emitTests: true,
  token,
  rawEvents,
});

[
  ...rawEvents,
  'follow',
  'subscription',
  'resubscription',
  'bits',
  'host',
  'donation',
].forEach((eventName) => {
  client.on(eventName, (...data) => {
    console.log(eventName, JSON.stringify(data)); // eslint-disable-line
  });
});

client.connect();

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
