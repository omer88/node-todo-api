const { MongoClient } = require('mongodb');

(async () => {
  try {
    const client = await MongoClient.connect('mongodb://localhost:27017');
    console.log('Connected to mongodb server.');
    const db = client.db('TodoApp');
    const docs = await db
      .collection('Todos')
      .find({ completed: false })
      .toArray();
    console.log('Todos');
    console.log(JSON.stringify(docs, null, 2));
    client.close();
  } catch (err) {
    return console.log(err);
  }
})();
