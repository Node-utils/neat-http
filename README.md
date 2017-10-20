# neat-request
Light-weight Promise wrap for raw http.request

### Install
```shell
npm install neat-http
```

### Hello neat_http
```js
// Now is mostly used for proxy
const request = require('neat-http');

const server = http.createServer(async function(sreq, sres) {
  const url_parts = url.parse(sreq.url);
  const opts = {
    host: 'google.com',
    port: 80,
    path: url_parts.pathname,
    method: sreq.method,
    headers: sreq.headers
  };
  const ext = {
    req: sreq, // pipe client request to server
    // timeout(Num): If None, Default is 15sec
    // toJSON(bool): Default is False.
  };
  const cres = await request(opts, ext);
  sres.writeHead(cres.statusCode, cres.headers);
  cres.pipe(sres); // pipe client to server response
});
server.listen(80, '0.0.0.0');

```

### LBClient
```js
const neat_http = require('../index.js');

const arr = [{
    host: 'www.upstream1.com',
    port: 8080
  },
  {
    host: 'www.upstream2.com',
    port: 8080
  },
];

const client = new neat_http.LBClient({
  path: '/path'
}, {
  rr: arr,
  timeout: 5000,
  healthCheckOpts: {
    path: '/check',
  },
  healthCheckFn: cres => cres.statusCode == 200,
  healthCheckCycle: 3000, //ms, every cycle will check all hosts
});

(async() => {
  const res = await client.send({
    path: '/test/client'
    });
})()
```

## API

### neat_http(request[opts [,ext]])
- `opts` (obj) - Default is `{}`, the same as raw `http.request(options)`'s parameter.
- `ext` (obj) - Default is `{}`, is extension object.
- `ext.req` (http.ClientRequest): raw `http.ClientRequest` instance, used for request pipe.
- `ext.timeout` (num): timeout in `ms`, Default is `15 second`, if upstream not response, reject error.
- `ext.toJSON` (bool): Default is `false`, if set true, will return an Object parsed from response.
- `ext.toText` (bool): Default is `false`, if set true, will return an String parsed from response.

### Class: neat_http.LBClient
#### new LBClient(opts [,ext])

- `ext.rr` (Array) - : Default is `undefined`.Every element of arr will merge into `options`, in a round-robin manner. especially when need **Load-Balance**. (If `rr`'s element have same key with `options`, it will not merge into, please put common key in options, dynamic for **Load-Banlance** put in `rr` )
- `ext.healthCheckOpts` (obj): Default is `{}`, use from healCheck request `options`.
- `ext.healthCheckFn` (fn): Default when healthCheck's response's statusCode is `200`, will recieve one parameter is raw `http.ServerResponse` instance(healthCheck's response).
- `ext.healthCheckCycle` (num): Default is `5000(ms)`, one cycle will check all upstreams in `rr`.
- `ext.timeout` (num) - Defalut is `15s`, timeout(ms) between proxy request send and recieve response.
#### client.send(opts)
The same as default `neat-http`(request).

### Class: neat_http.HostClient
### Class: neat_http.createRequest