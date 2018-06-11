const app = require('./app');
const { mongoose } = require('./db/mongoose');

app.listen(3000, () => {
  console.log('listening to port 3000');
});
