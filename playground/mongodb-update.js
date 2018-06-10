const { MongoClient, ObjectID } = require('mongodb');

(async () => {
  try {
    const client = await MongoClient.connect('mongodb://localhost:27017');
    const db = client.db('TodoApp');
    const item = await db
      .collection('Users')
      .findOneAndUpdate(
        { _id: new ObjectID('5b1a285766db293a970c8bc1') },
        { $set: { name: 'Omer' }, $inc: { age: 1 } },
        { returnOriginal: false }
      );
    console.log(item);
    client.close();
  } catch (error) {
    console.log(error);
  }
})();
