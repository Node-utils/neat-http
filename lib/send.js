'use strict';

const http = require('http');
const https = require('https');
const Stream = require('stream');
const Promise = require('bluebird');
const DEFAULT_TIMEOUT = 15 * 1000;

// send is no rr, can be accomplished merge element into opts.
module.exports = function send(opts, ext = {}) {
  const {
    req,
    timeout,
    toJSON,
    toString,
  } = ext;
  const request = (opts.protocol === 'https:' ? https : http).request;
  return new Promise((resolve, reject) => {
    const creq = request(opts);
    creq.on('error', function (err) {
      reject(err)
    });

    let reqTimeout;
    let abort = false;

    // 当有socket分配给这个请求
    creq.once('socket', socket => {
      reqTimeout = setTimeout(() => {
        abort = true;
        creq.abort();
        reject(new Error('request-timeout'));
      }, timeout || DEFAULT_TIMEOUT);
    });

    // equal http.request 2nd param: callback
    creq.once('response', cres => {
      if (toJSON || toString) {
        let accum = [];
        let accumBytes = 0;
        // ref from node-fetch body.js

        cres.on('data', chunk => {
          if (abort || chunk === null) {
            return;
          }
          accumBytes += chunk.length;
          accum.push(chunk);
        });

        cres.on('end', (err) => {
          if (abort) {
            return;
          }

          // 对于体积过大的响应, 在其传输完成后调用 clear
          clearTimeout(reqTimeout);
          try {
            if (toString) resolve(Buffer.concat(accum).toString());
            resolve(JSON.parse(Buffer.concat(accum).toString()));
          } catch (err) {
            reject(err);
          }
        });

        cres.on('error', () => {
          reject(err)
        });
        return
      }
      clearTimeout(reqTimeout);
      resolve(cres)
    });

    // stream 直接pipe
    if (req instanceof Stream) {
      req.pipe(creq)
      return
    }
    // 自定义请求需要手动 end.
    if (req) {
      creq.end(req)
      return;
    }
    creq.end()

  })
}