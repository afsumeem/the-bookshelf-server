require('dotenv').config();
const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

const cors = require('cors');

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7s5ai.mongodb.net/?retryWrites=true&w=majority`;



const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const run = async () => {
  try {
    const db = client.db('the-bookshelf');
    const bookCollection = db.collection('books');

    // get all books

    app.get('/books', async (req, res) => {
      const cursor = bookCollection.find({});
      const book = await cursor.toArray();

      res.send({ status: true, data: book });
    });

    //post a new book

    app.post('/books', async (req, res) => {
      const book = req.body;

      const result = await bookCollection.insertOne(book);

      res.json(result);
    });

    //
  
    app.get('/book/:id', async (req, res) => {
      const id = req.params.id;

      const result = await bookCollection.findOne({ _id: ObjectId(id) });
      console.log(result);
      res.send(result);
    });

    app.delete('/book/:id', async (req, res) => {
      const id = req.params.id;

      const result = await bookCollection.deleteOne({ _id: ObjectId(id) });
      console.log(result);
      res.send(result);
    });

    app.post('/review/:id', async (req, res) => {
      const bookId = req.params.id;
      const review = req.body.reviews;


      const result = await bookCollection.updateOne(
        { _id: ObjectId(bookId) },
        { $push: { reviews: review } }
      );

      if (result.modifiedCount !== 1) {
        console.error('book not found or review not added');
        res.json({ error: 'book not found or review not added' });
        return;
      }

      console.log('Review added');
      res.json({ message: 'Review not added' });
    });

    app.get('/review/:id', async (req, res) => {
      const bookId = req.params.id;

      const result = await bookCollection.findOne(
        { _id: ObjectId(bookId) },
        { projection: { _id: 0, reviews: 1 } }
      );

      if (result) {
        res.json(result);
      } else {
        res.status(404).json({ error: 'book not found' });
      }
    });

    app.post('/user', async (req, res) => {
      const user = req.body;

      const result = await userCollection.insertOne(user);

      res.send(result);
    });

    app.get('/user/:email', async (req, res) => {
      const email = req.params.email;

      const result = await userCollection.findOne({ email });

      if (result?.email) {
        return res.send({ status: true, data: result });
      }

      res.send({ status: false });
    });

    //
  } finally {
  }
};

run().catch((err) => console.log(err));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
