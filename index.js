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
