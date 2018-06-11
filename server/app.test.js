const request = require('supertest');
const mongoose = require('mongoose');
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
