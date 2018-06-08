const { MongoClient, ObjectID } = require('mongodb');

MongoClient.connect(
  'mongodb://localhost:27017',
  async (error, client) => {
    if (error) {
      return console.log('Unable to connect to mongodb server.');
    }
    console.log('Connected to mongodb server.');
    const db = client.db('TodoApp');

    // db.collection('Todos').insertOne(
    //   { text: 'Something to do', completed: false },
    //   (error, result) => {
    //     if (error) {
    //       return console.log('Unable to insert todo.', err);
    //     }
    //     console.log(JSON.stringify(result.ops, null, 2));
    //   }
    // );
    try {
      const result = await db
        .collection('Users')
        .insertOne({ name: 'Omer', age: 30, location: 'Ramat Gan' });
      console.log(JSON.stringify(result.ops, null, 2));
    } catch (err) {
      return console.log('Unable to insert user.', err);
    }
    client.close();
  }
);
