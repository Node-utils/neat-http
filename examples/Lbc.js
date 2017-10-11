const neat_http = require('../index.js');

const arr = [{
    host: 'localhost',
    port: 8000
  },
  {
    host: 'localhost',
    port: 9000
  },
];

const client = new neat_http.LBClient({
  path: '/path'
}, {
  rr: arr,
  healthCheckOpts: {},
  healthCheckFn: cres => cres.statusCode == 200,
});

(async() => {
  for (let i = 0; i < 10; i++) {
    console.log(await client.healthCheck());
  }
  console.log('done')
})()