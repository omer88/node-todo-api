const request = require('supertest');
const mongoose = require('mongoose');
const { ObjectID } = require('mongodb');

const MongodbMemoryServer = require('mongodb-memory-server').default;

const app = require('./app');
const { Todo } = require('./models/Todo');
const { User } = require('./models/User');

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
  await Todo.remove({});
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

    const todos = await Todo.find();
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
    expect(todos.length).toBe(0);
  });
});

describe('GET /todos', () => {
  const todos = [{ text: 'Todo text 1' }, { text: 'Todo text 2' }];
  beforeEach(async () => {
    await Todo.insertMany(todos);
  });
  test('should get all todos', async () => {
    const response = await request(app).get('/todos');
    expect(response.statusCode).toBe(200);
    expect(response.body.todos[0]).toMatchObject(todos[0]);
    expect(response.body.todos[1]).toMatchObject(todos[1]);
  });
});

describe('GET /todos/:id', () => {
  const objId1 = new ObjectID().toHexString();
  const objId2 = new ObjectID().toHexString();
  const todos = [
    { _id: objId1, text: 'Todo text 1' },
    { _id: objId2, text: 'Todo text 2' },
  ];
  beforeEach(async () => {
    await Todo.insertMany(todos);
  });
  test('should /todo/:id return a valid object', async () => {
    const response = await request(app).get(`/todos/${objId1}`);
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
