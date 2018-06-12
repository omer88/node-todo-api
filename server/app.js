const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const { ObjectID } = require('mongodb');

const { Todo } = require('./models/Todo');
const { User } = require('./models/User');
const { authenticate } = require('./middleware/authenticate');

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

app.get('/todos', async (req, res) => {
  try {
    const todos = await Todo.find();
    res.send({ todos });
  } catch (error) {
    res.status(400).send(error);
  }
});

app.get('/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectID.isValid(id)) {
      return res.status(404).send();
    }
    const todo = await Todo.findById(id);
    if (!todo) {
      return res.status(404).send();
    }
    res.send({ todo });
  } catch (error) {
    res.status(400).send();
  }
});

app.delete('/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectID.isValid(id)) {
      return res.status(404).send();
    }
    const todo = await Todo.findByIdAndRemove(id);
    if (!todo) {
      return res.status(404).send();
    }
    return res.send({ todo });
  } catch (error) {
    res.status(400).send();
  }
});

app.patch('/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const body = _.pick(req.body, ['text', 'completed']);
    if (!ObjectID.isValid(id)) {
      return res.status(404).send();
    }
    if (_.isBoolean(body.completed) && body.completed) {
      body.completedAt = new Date().getTime();
    } else {
      body.completed = false;
      body.completedAt = null;
    }
    const todo = await Todo.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true }
    );
    if (!todo) {
      return res.status(404).send();
    }
    res.send({ todo });
  } catch (error) {
    res.status(400).send();
  }
});

app.post('/users', async (req, res) => {
  try {
    const body = _.pick(req.body, ['email', 'password']);
    const user = new User(body);
    await user.save();
    const token = await user.generateAuthToken();
    res.header('x-auth', token).send(user);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.get('/users/me', authenticate, async (req, res) => {
  res.send(req.user);
});

app.post('/users/login', async (req, res) => {
  try {
    const body = _.pick(req.body, ['email', 'password']);
    const user = await User.findByCredentials(body.email, body.password);
    const token = await user.generateAuthToken();
    res.header('x-auth', token).send(user);
  } catch (error) {
    res.status(400).send();
  }
});
module.exports = app;
