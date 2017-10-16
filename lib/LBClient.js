'use strict';

const rr = require('neat-rr');
const send = require('./send.js');
const {
  extend,
  filter,
  parseTarget,
  dftHealthCheckFn,
  findHostItem,
} = require('./utils.js');
const DEFAULT_CYCLE = 5000;

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
    this.ext = filter(ext, ['rr', 'healthCheckOpts', 'healthCheckFn', 'healthCheckCycle']);
    // 3. rr
    if (!rr || rr.length === 0) {
      throw new Error('ext.rr cannot be empty!');
    }
    this.rr = ext.rr.map(item => {
      return extend({}, item, opts);
    });
    this.ava = this.rr.map(item => Object.assign({}, item));
    this.getRR = rr(this.rr);
    // 4. HealthCheck(opts, cres) return bool
    if (ext.healthCheckOpts) {
      const healthCheckFn = ext.healthCheckFn || dftHealthCheckFn;
      const getHRR = rr(this.rr.map(item => {
        return extend({}, item, ext.healthCheckOpts);
      }));
      this.healthCheck = async() => {
        try {
          const opts = getHRR();
          const cres = await send(opts, this.ext); // two ext is different !
          const bool = healthCheckFn(cres);
          if (bool) {
            // if ava is complete, done
            if (this.ava.length === this.rr.length) console.log('all is ok')
            if (this.ava.length === this.rr.length) return bool;
            // else if not in ava, add it, refresh getRR.
            const index = findHostItem(opts, this.ava).index;
            if (!index) {
              console.log(findHostItem(opts, this.rr).item.host, 'is up.')
              this.ava.push(findHostItem(opts, this.rr).item);
              this.getRR = rr(this.ava);
            }
          } else {
            // if in ava, delete in ,refresh getRR
            const index = findHostItem(opts, this.ava).index;
            if (index) {
              console.log(findHostItem(opts, this.ava).item.host, 'is down')
              this.ava = this.ava.slice(0, index).concat(this.ava.slice(index + 1));
              this.getRR = rr(this.ava);
            }
          }
          return bool;
        } catch (err) {
          console.log(err.message)
          return err.message;
        }
      }
      setInterval(this.healthCheck.bind(this), ((ext.healthCheckCycle || DEFAULT_CYCLE) / this.rr.length) >> 0);
    }
    // 5. send
    this.send = this.send.bind(this);
  }

  send(send_opts = {}, send_ext = {}) {
    return send(extend(send_opts, this.getRR()), extend(send_ext, this.ext));
  }
}