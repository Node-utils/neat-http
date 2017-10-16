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
  healthCheckOpts: {
    path: '/check',
  },
  healthCheckFn: cres => cres.statusCode == 200,
  healthCheckCycle: 3000, //ms, every cycle will check all hosts
});

(async() => {
  for (let i = 0; i < 10; i++) {
    console.log(await client.healthCheck());
  }
  console.log('done')
  setInterval(() => {
    client.send({
      path: '/test/client'
    }).catch(err => {
      console.error(err)
    })
  }, 500)
})()