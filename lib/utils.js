'use strict';

module.exports.extend = function extend(to, ...froms) {
  for (let from of froms) {
    if (!from) continue;
    for (let key in from) {
      to[key] = from[key];
    }
  }
  return to;
}

module.exports.filter = function extend(from, keys) {
  const to = {};
  for (let key in from) {
    if (keys.indexOf(key) === -1) {
      to[key] = from[key];
    }
  }
  return to;
}