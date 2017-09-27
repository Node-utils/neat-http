'use strict';

const rr = require('neat-rr');
const send = require('./send.js');
const {
  extend,
  filter
} = require('./utils.js');

const noop = () => {};
// opts, ext is common static; prefer than send_opts & send_ext;
// get RR is for opt, is dynamic;
// send_opts, send_ext is dynamic;
module.exports = (opts = {}, ext = {}) => {
  const getRR = ext.rr ? rr(ext.rr) : noop; // only run once
  ext = filter(ext, ['rr']);
  return (send_opts = {}, send_ext = {}) => {
    return send(extend(send_opts, getRR(), opts), extend(send_ext, ext)); // later one is prefer!
  }
}