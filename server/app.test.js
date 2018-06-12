const request = require('supertest');
const mongoose = require('mongoose');
const { ObjectID } = require('mongodb');
const _ = require('lodash');

const MongodbMemoryServer = require('mongodb-memory-server').default;

const app = require('./app');
const { Todo } = require('./models/Todo');
const { User } = require('./models/User');

const { todos, populateTodos, users, populateUsers } = require('./tests/seed');

// May require additional time for downloading MongoDB binaries
jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;

let mongoServer;

beforeAll(async () => {
  mongoServer = new MongodbMemoryServer();
  const mongoUri = await mongoServer.getConnectionString();
  await mongoose.connect(
    mongoUri,
    err => {
      if (err) console.error(err);
    }
  );
});

afterAll(() => {
  mongoose.disconnect();
  mongoServer.stop();
});

beforeEach(async () => {
  await populateUsers();
  await populateTodos();
});

describe('POST /todos', () => {
  test('should create new todo - callback form', done => {
    const task = { text: 'Task 1' };
    request(app)
      .post('/todos')
      .send(task)
      .expect(200)
      .expect(response => {
        expect(response.body).toMatchObject(task);
      })
      .end((err, res) => {
        if (err) {
          throw done(err);
        }
        done();
      });
  });

  test('should create new todo - async form', async () => {
    const text = 'Task 1';
    const task = { text };
    const response = await request(app)
      .post('/todos')
      .send(task);

    const todos = await Todo.find(task);
    expect(response.statusCode).toBe(200);
    expect(response.body).toMatchObject(task);
    expect(todos[0].text).toBe(text);
  });

  test('should not create todo  with invalid body data', async () => {
    const response = await request(app)
      .post('/todos')
      .send({});
    const todos = await Todo.find();
    expect(response.statusCode).toBe(400);
    expect(todos.length).toBe(2);
  });
});

describe('GET /todos', () => {
  test('should get all todos', async () => {
    const response = await request(app).get('/todos');
    expect(response.statusCode).toBe(200);
    expect(response.body.todos[0]).toMatchObject(todos[0]);
    expect(response.body.todos[1]).toMatchObject(todos[1]);
  });
});

describe('GET /todos/:id', () => {
  test('should /todo/:id return a valid object', async () => {
    const response = await request(app).get(`/todos/${todos[0]._id}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.todo).toMatchObject(todos[0]);
  });

  test('should /todo/:id return 404 on invalid object Id', async () => {
    const response = await request(app).get(`/todos/123`);
    expect(response.statusCode).toBe(404);
  });

  test('should /todo/:id return 404 on missing id', async () => {
    const someId = new ObjectID().toHexString();
    const response = await request(app).get(`/todos/${someId}`);
    expect(response.statusCode).toBe(404);
  });
});

describe('DELETE /todos/:id', () => {
  test('should /todo/:id delete and return a valid object', async () => {
    const response = await request(app).delete(`/todos/${todos[0]._id}`);
    const ret = await Todo.findById(todos[0]._id);
    expect(response.statusCode).toBe(200);
    expect(response.body.todo).toMatchObject(todos[0]);
    expect(ret).toBeNull();
  });

  test('should /todo/:id return 404 on invalid object Id', async () => {
    const response = await request(app).delete(`/todos/123`);
    expect(response.statusCode).toBe(404);
  });

  test('should /todo/:id return 404 on missing id', async () => {
    const someId = new ObjectID().toHexString();
    const response = await request(app).delete(`/todos/${someId}`);
    expect(response.statusCode).toBe(404);
  });
});

describe('PATCH /todos/:id', () => {
  test('should update the todo', async () => {
    const updateObject = { text: 'new text', completed: true };
    const response = await request(app)
      .patch(`/todos/${todos[1]._id}`)
      .send(updateObject);

    const result = await Todo.findById(todos[1]._id);
    expect(response.statusCode).toBe(200);
    expect(response.body.todo).toMatchObject(updateObject);
    expect(result).toMatchObject(updateObject);
    expect(typeof result.completedAt).toBe('number');
  });

  test('should clear completedAt when todo is not completed', async () => {
    const resultObject = {
      text: todos[0].text,
      completed: false,
      completedAt: null,
    };
    const response = await request(app)
      .patch(`/todos/${todos[0]._id}`)
      .send({ completed: false });

    const result = await Todo.findById(todos[0]._id);
    expect(response.statusCode).toBe(200);
    expect(response.body.todo).toMatchObject(resultObject);
    expect(result).toMatchObject(resultObject);
  });
});

describe('GET /users/me', () => {
  test('should return user if authenticated', async () => {
    const token = users[0].tokens[0].token;
    const response = await request(app)
      .get('/users/me')
      .set('x-auth', token);
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(_.pick(users[0], ['_id', 'email']));
  });

  test('should return 401 if not authenticated', async () => {
    const response = await request(app).get('/users/me');
    expect(response.statusCode).toBe(401);
    expect(response.body).toEqual({});
  });
});

describe('POST /users', () => {
  test('should create a user', async () => {
    const email = 'user1@example.com';
    const password = 'password';
    const response = await request(app)
      .post('/users')
      .send({ email, password });
    const dbUser = await User.findOne({ email });
    expect(response.statusCode).toBe(200);
    expect(response.header['x-auth']).not.toBeNull();
    expect(response.body._id).not.toBeNull();
    expect(response.body.email).toBe(email);
    expect(dbUser).not.toBeNull();
    expect(dbUser.password).not.toBeNull();
    expect(dbUser.password).not.toBe(password);
  });

  test('should return validation error if request is invalid', async () => {
    const email = 'wrongEmail';
    const password = 'password';
    const response = await request(app)
      .post('/users')
      .send({ email, password });
    expect(response.statusCode).toBe(400);
  });

  test('should not create user if email is in use', async () => {
    const password = 'password';
    const response2 = await request(app)
      .post('/users')
      .send({ email: users[0].email, password });
    expect(response2.statusCode).toBe(400);
  });
});
