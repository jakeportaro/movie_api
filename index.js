const mongoose = require('mongoose');
const Models = require('./models.js');
const { check, validationResult } = require('express-validator');

const Movies = Models.Movie;
const Users = Models.User;

const express = require('express'),
 bodyParser = require('body-parser'),
  uuid = require('uuid');

const app = express();

//mongoose.connect('mongodb://localhost:27017/movieapi', { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connect(process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true });


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const cors = require('cors');
app.use(cors());
let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');

let users = [
  {
    "id": 1,
    name: "Jake",
    favoriteMovies: ["Iron Man"]
  },
  {
    "id": 2,
    name: "Matt",
    favoriteMovies: ["Thor"]
  },
  {
    "id": 3,
    name: "Lauren",
    favoriteMovies: ["Iron Man"]
  }
  
];

let movies = [
  {
    "Title": 'Captain America',
    "Director":'Joe Johnston',
    "Genre": 'Action',
   },
  {
    "Title": 'Thor',
    "Director":'Kenneth Branagh',
    "Genre": 'Comdedy',
   },
  {
    "Title": 'Iron Man',
   "Director":'Jon Favreau',
   "Genre": 'Power',
   
  }
];

// Gets the list of data about ALL movies

app.get('/movies',
 passport.authenticate('jwt', { session: false }),
 (req, res) => {
  Movies.find()
    .then((movies) => {
      res.status(201).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});
// Gets the data about a single movies, by title

app.get('/movies/:Title', 
passport.authenticate('jwt', { session: false }),
(req, res) => {
  Movies.findOne({ Title: req.params.Title })
  .then((movie) => {
  res.json(movie);
  })
  .catch((err) => {
  console.error(err);
  res.status(500).send("Error: " + err);
  });
  });
  
  

// Gets the data about a movie by a genre name
app.get('/movies/genre/:Name',
 passport.authenticate('jwt', { session: false }),
(req, res) => {
  Movies.find({ 'Genre.Name': req.params.Name })
  .then((movie) => {
    res.json(movie);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});
//Gets the data about a director by name

app.get('/movies/director/:Name', 
passport.authenticate('jwt', { session: false }),
(req, res) => {
  Movies.findOne({ 'Director.Name': req.params.Name })
  .then((movie) => {
    res.json(movie);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

//Gets data of all users
app.get('/users', 
passport.authenticate('jwt', { session: false }),
(req, res) => {
  Users.find()
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//Get a user by username
app.get('/users/:Username', 
passport.authenticate('jwt', { session: false }),
(req, res) => {
  Users.findOne({ Username: req.params.Username })
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//Allow new users to register
app.post('/users',
  // Validation logic here for request
  //you can either use a chain of methods like .not().isEmpty()
  //which means "opposite of isEmpty" in plain english "is not empty"
  //or use .isLength({min: 5}) which means
  //minimum value of 5 characters are only allowed
  [
    check('Username', 'Username is required').isLength({min: 5}),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
  ], (req, res) => {

  // check the validation object for errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOne({ Username: req.body.Username }) // Search to see if a user with the requested username already exists
      .then((user) => {
        if (user) {
          //If the user is found, send a response that it already exists
          return res.status(400).send(req.body.Username + ' already exists');
        } else {
          Users
            .create({
              Username: req.body.Username,
              Password: hashedPassword,
              Email: req.body.Email,
              Birthday: req.body.Birthday
            })
            .then((user) => { res.status(201).json(user) })
            .catch((error) => {
              console.error(error);
              res.status(500).send('Error: ' + error);
            });
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
  });

//allow users to update username
app.put('/users/:Username', 
[
  check('Username', 'Username is required').isLength({min: 5}),
  check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
  check('Password', 'Password is required').not().isEmpty(),
  check('Email', 'Email does not appear to be valid').isEmail()
], (req, res) => {

// check the validation object for errors
  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

 
passport.authenticate('jwt', { session: false });
let hashedPassword = Users.hashPassword(req.body.Password);
  Users.findOneAndUpdate({ Username: req.params.Username }, { $set:
    {
      Username: req.body.Username,
      Password: hashedPassword,
      Email: req.body.Email,
      Birthday: req.body.Birthday
    }
  },
  { new: true }, // This line makes sure that the updated document is returned
  (err, updatedUser) => {
    if(err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});





// Adds data for a new movie to our list of favorite movies for a users.
app.post('/users/:Username/movies/:MovieID',
passport.authenticate('jwt', { session: false }),
(req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, {
     $push: { FavoriteMovies: req.params.MovieID }
   },
   { new: true }, // This line makes sure that the updated document is returned
  (err, updatedUser) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});

// Deletes a movie from our list by ID
app.delete('/users/:Username/movies/:MovieID', 
passport.authenticate('jwt', { session: false }),
(req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, {
     $pull: { FavoriteMovies: req.params.MovieID }
   },
   { new: true }, // This line makes sure that the updated document is returned
  (err, updatedUser) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});

//Allow user to unregister/delete their username
app.delete('/users/:Username', 
passport.authenticate('jwt', { session: false }),
(req, res) => {
  Users.findOneAndRemove({ Username: req.params.Username })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.Username + ' was not found');
      } else {
        res.status(200).send(req.params.Username + ' was deleted.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});


app.get('/',
(req, res) => {
  res.send('Welcome to my App!');
 
});


const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0',() => {
 console.log('Listening on Port ' + port);
});


