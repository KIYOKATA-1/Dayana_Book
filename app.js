const express = require('express');
const app = express();
const Book = require('./src/database.js'); 
const mongoose = require('mongoose');
const methodOverride = require('method-override');
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
const port = 3010;

app.use(methodOverride('_method'));

app.use(express.static("public"));

mongoose.connect('mongodb://localhost:27017/BOOK', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

app.set('view engine', 'ejs');


app.get("/", function(req, res) {
    res.redirect("/main");
});

app.get("/main", async function(req, res) {
    try {
        res.render('main');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching books from the database');
    }
});
app.get("/add", function(req, res) {
    res.render('add');
});

app.get("/catalog", async function(req, res) {
    try {
        const books = await Book.find({}).exec();

        res.render('catalog', { books });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching books from the database');
    }
});


app.post("/catalog", async function(req, res) {
    try {
        const books = await Book.find({}).exec();
        console.log(books);
        res.render('catalog', { books: books });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching books from the database');
    }
});


app.post("/add", async function(req, res) {
    try {
        const { title, author, genre, year } = req.body;

        if (isNaN(year)) {
            return res.status(400).send('Year should be a valid number');
        }

        const newBook = new Book({
            title: title,
            author: author,
            genre: genre,
            year: parseInt(year)
        });

        const savedBook = await newBook.save();
        
        console.log('Book added successfully:', savedBook);
        res.redirect("/main"); 
    } catch (err) {
        console.error(err);
        res.status(500).send('Error saving book to the database');
    }
});

app.get("/edit", async function(req, res) {
    try {
        const books = await Book.find({}).exec();
        res.render('edit', { books });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching books for editing');
    }
});




app.put("/edit/:id", async function(req, res) {
    try {
        const bookId = req.params.id;
        const { title, author, genre, year } = req.body;

        if (isNaN(year)) {
            return res.status(400).send('Year should be a valid number');
        }

        const updatedBook = await Book.findByIdAndUpdate(
            bookId,
            {
                title: title,
                author: author,
                genre: genre,
                year: parseInt(year)
            },
            { new: true }
        ).exec();

const books = await Book.find().exec();
        res.render('main', { books });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error updating book in the database');
    }
});



app.delete("/edit/:id", async function(req, res) {
    try {
        const bookId = req.params.id;

        const deletedBook = await Book.findByIdAndDelete(bookId).exec();

        if (!deletedBook) {
            return res.status(404).send('Book not found');
        }

        const books = await Book.find().exec();
        res.render('main', { books });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error deleting book from the database');
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

