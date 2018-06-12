const app = require('./app');
require('./db/mongoose');

const port = process.env.port || 3000;
app.listen(port, () => {
  console.log(`listening to port ${port}`);
});
