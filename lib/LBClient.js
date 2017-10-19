'use strict';

const rr = require('neat-rr');
const send = require('./send.js');
const {
  extend,
  filter,
  parseTarget,
  dftHealthCheckFn,
  dftErrRes,
  timeout,
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
    this.rr = ext.rr.map(item => Object.assign(item, opts));
    this.getRR = rr(this.rr);
    // 4. HealthCheck(opts, cres) return bool
    if (ext.healthCheckOpts) {
      // ava's item are same as this.rr;
      this._healthCheckOpts = ext.healthCheckOpts;
      this._healthCheckCycle = ext.healthCheckCycle || DEFAULT_CYCLE;
      this.hExt = Object.assign({}, this.ext, {
        timeout: this._healthCheckCycle,
      });
      this._healthCheckFn = ext.healthCheckFn || dftHealthCheckFn;
      this.ava = this.rr.slice(0);
      this._getHRR = rr(this.rr);
      this.healthCheck = async() => {
        try {
          const opts = this._getHRR();
          // two ext is different !
          const cres = await send(extend({}, opts, this._healthCheckOpts), this.hExt)
            .catch(err => dftErrRes);
          const bool = this._healthCheckFn(cres);
          if (bool) {
            // if ava is complete, done
            if (this.ava.length === this.rr.length) return bool;
            // else if not in ava, add it, refresh getRR.
            if (this.ava.indexOf(opts) === -1) {
              this.ava.push(opts);
              this.getRR = rr(this.ava);
              // recovery send
              if (this.ava.length === 1) this.send = this.Do.bind(this);
            }
          } else {
            // if in ava, delete in ,refresh getRR
            const index = this.ava.indexOf(opts);
            if (index !== -1) {
              this.ava = this.ava.slice(0, index).concat(this.ava.slice(index + 1));
              // ava is [], send is no use.
              if (this.ava.length === 0) {
                this.send = () => Promise.reject('No avaiable Upstream');
              } else {
                this.getRR = rr(this.ava);
              }
            }
          }
          return bool;
        } catch (err) {
          return Promise.reject(err);
        }
      }
      this._interval = () => {
        const n = (this._healthCheckCycle / this.rr.length) >> 0;
        // setInterval lower resources.
        setInterval(this.healthCheck.bind(this), n)
      }
      this._interval();
    }
    // 5. send
    this.send = this.Do.bind(this);
  }

  Do(send_opts = {}, send_ext = {}) {
    return send(extend(send_opts, this.getRR()), extend(send_ext, this.ext));
  }
}