const { ObjectID } = require('mongodb');
const jwt = require('jsonwebtoken');

const { Todo } = require('../models/Todo');
const { User } = require('../models/User');

const user1Id = new ObjectID().toHexString();
const user2Id = new ObjectID().toHexString();
const users = [
  {
    _id: user1Id,
    email: 'omer@example.com',
    password: 'PasswordOne',
    tokens: [
      {
        access: 'auth',
        token: jwt.sign({ _id: user1Id, access: 'auth' }, 'abc123').toString(),
      },
    ],
  },
  {
    _id: user2Id,
    email: 'shani@example.com',
    password: 'PasswordTwo',
    tokens: [
      {
        access: 'auth',
        token: jwt.sign({ _id: user2Id, access: 'auth' }, 'abc123').toString(),
      },
    ],
  },
];

const populateUsers = async () => {
  await User.remove({});
  const p1 = new User(users[0]).save();
  const p2 = new User(users[1]).save();
  return Promise.all([p1, p2]);
};

const todos = [
  {
    _id: new ObjectID().toHexString(),
    text: 'Todo text 1',
    completed: true,
    completedAt: 123,
    _creator: user1Id,
  },
  { _id: new ObjectID().toHexString(), text: 'Todo text 2', _creator: user2Id },
];
const populateTodos = async () => {
  await Todo.remove({});
  await Todo.insertMany(todos);
};
module.exports = { todos, populateTodos, users, populateUsers };
