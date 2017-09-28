'use strict';
const url = require('url');

module.exports.extend = (to, ...froms) => {
  for (let from of froms) {
    if (!from) continue;
    for (let key in from) {
      to[key] = from[key];
    }
  }
  return to;
}

module.exports.filter = (from, keys) => {
  const to = {};
  for (let key in from) {
    if (keys.indexOf(key) === -1) {
      to[key] = from[key];
    }
  }
  return to;
}

// protocol, auth, host, port getFrom `target`
module.exports.parseTarget = (target) => {
  const {
    protocol,
    auth,
    hostname,
    port
  } = url.parse(target);
  return {
    protocol,
    auth,
    host: hostname,
    port
  };
}

module.exports.dftHealthCheckFn = (cres) => {
  return cres.statusCode == 200;
}