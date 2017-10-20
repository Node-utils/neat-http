const request = require('../index.js');

const arr = [
  {
    host: 'localhost',
    port: 8000
  },
  {
    host: 'localhost',
    port: 9000
  }
];

const request = request.createClient(
  {
    path: '/path'
  },
  {
    rr: arr
  }
);

(async() => {
  for (let i = 0; i < 100; i++) {
    await request();
  }
  console.log('done');
})();
