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

    //get latest books
    app.get("/books", async (req, res) => {
      const sort = { publishedDate: -1 };
      const result = await bookCollection
        .find({})
        .sort(sort)
        .limit(10)
        .toArray();
       res.send({
        status:true,
        data: result,
      });
    });
    // get all books

    app.get('/allBooks', async (req, res) => {
      const { search, genre, publicationYear } = req.query;

      const filter = {};

      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: "i" } },
          { author: { $regex: search, $options: "i" } },
          { genre: { $regex: search, $options: "i" } },
        ];
      }
      if (genre) {
        filter.genre = genre;
      }

      if (publicationYear) {
        filter.publicationDate = {
          $regex: `^${publicationYear}-`,
          $options: "i",
        };
      }
      const books = await bookCollection.find(filter).toArray();

       res.send({
        status:true,
        data: books,
      });
    });

    //post a new book

    app.post('/books/add-book', async (req, res) => {
      const data = req.body;

      const result = await bookCollection.insertOne(data);
    console.log(result);
      res.json(result);
    });

    //single book
  
    app.get('/books/:id', async (req, res) => {
      const id = req.params.id;

      const result = await bookCollection.findOne({ _id: ObjectId(id) });
      console.log(result);
      res.send(result);
    });

    //update book

    app.patch("/books/edit-book/:id", async (req, res) => {
    
          const bookId = req.params.id;
          const updatedBookData = req.body;

          delete updatedBookData._id;

          const result = await bookCollection.updateOne(
            { _id: new ObjectId(bookId) },
            { $set: updatedBookData }
          );

          if (result.matchedCount > 0) {
            res.status(200).send({
              message: "Book updated successfully!",
              book: updatedBookData,
            });
          } else {
             res.status(404).send({
              message: "Book not found",
            });
          }
    });

    //delete book
    app.delete('/book/:id', async (req, res) => {
      const id = req.params.id;

      const result = await bookCollection.deleteOne({ _id: ObjectId(id) });
      console.log(result);
      res.send(result);
    });

    //review

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

    //get review

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
