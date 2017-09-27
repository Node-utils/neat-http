'use strict';

const rr = require('neat-rr');
const send = require('./send.js');
const {
  extend,
  filter
} = require('./utils.js');

// opts, ext is common;
// ext.rr is individual opt;
// send_opts, send_ext is dynamic;

module.exports = class LBClient {
  constructor(opts = {}, ext = {}) {
    this.ext = filter(ext, ['rr', 'HealthCheck']);
    // HealthCheck(opts, cres) return bool
    this.HealthCheck = ext.HealthCheck;
    this.rr = [];
    for (let opt of ext.rr) {
      this.rr.push(extend({}, opt, opts));
    }
    if (rr.length === 0) {
      throw new Error('ext.rr cannot be empty!');
    }
    this.getRR = rr(this.rr);
    this.send = this.send.bind(this);
  }

  send(send_opts = {}, send_ext = {}) {
    send(extend(send_opts, this.getRR()), extend(send_ext, this.ext));
  }
}