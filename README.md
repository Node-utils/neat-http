# neat-request
Light-weight Promise wrap for raw http.request

### Install
```shell
npm install neat-http
```

### Hello http
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
