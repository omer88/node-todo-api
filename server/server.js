const express = require('express');
const bodyParser = require('body-parser');

const { mongoose } = require('./db/mongoose');
const { Todo } = require('./models/Todo');
const { User } = require('./models/User');

const app = express();

app.use(bodyParser.json());
app.post('/todos', async (req, res) => {
  try {
    const todo = new Todo({ text: req.body.text });
    const doc = await todo.save();
    res.send(doc);
  } catch (error) {
    res.send(e);
  }
});
app.listen(3000, () => {
  console.log('listening to port 3000');
});
