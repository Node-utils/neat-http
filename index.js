'use strict';

const send = require('./lib/send.js');
const createClient = require('./lib/createClient.js');

module.exports = send;
module.exports.createClient = createClient;