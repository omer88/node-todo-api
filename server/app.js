const express = require('express');
const bodyParser = require('body-parser');

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
    res.status(400).send(error);
  }
});

module.exports = app;
