'use strict';

const rr = require('neat-rr');
const send = require('./send.js');
const {
  extend,
  filter,
  parseTarget,
  dftHealthCheckFn,
} = require('./utils.js');

// opts, ext is common;
// ext.rr is individual opt;
// send_opts, send_ext is dynamic;

module.exports = class LBClient {
  constructor(opts = {}, ext = {}) {
    // 1. parse url
    if (typeof opts === 'string') {
      if (!opts.startsWith('http')) throw new Error('If opts if represent url, it must be absolute.');
      opts = parseTarget(opts);
    }
    // 2. filter ext
    this.ext = filter(ext, ['rr', 'HealthCheck']);
    // 3. rr
    if (!rr || rr.length === 0) {
      throw new Error('ext.rr cannot be empty!');
    }
    this.rr = ext.rr.map(item => {
      return extend({}, item, opts);
    })
    this.getRR = rr(this.rr);
    // 4. HealthCheck(opts, cres) return bool
    if (ext.healthCheckOpts) {
      const healthCheckFn = ext.healthCheckFn || dftHealthCheckFn;
      const getHRR = rr(this.rr.map(item => {
        return extend({}, ext.healthCheckOpts, item);
      }));
      this.healthCheck = async() => {
        const cres = await send(getHRR(), this.ext); // two ext is different !
        return healthCheckFn(cres);
      }
    }
    // 5. send
    this.send = this.send.bind(this);
  }

  send(send_opts = {}, send_ext = {}) {
    return send(extend(send_opts, this.getRR()), extend(send_ext, this.ext));
  }
}