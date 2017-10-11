'use strict';

const send = require('./send.js');
const {
  extend,
} = require('./utils.js');

module.exports = class HostClient {
  constructor(opts = {}, ext = {}) {
    this.opts = opts;
    this.ext = ext;
    this.send = this.send.bind(this);
  }

  send(send_opts = {}, send_ext = {}) {
    return send(extend(send_opts, this.opts), extend(send_ext, this.ext));
  }
}