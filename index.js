const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;

const express = require('express'),
 bodyParser = require('body-parser'),
  uuid = require('uuid');

const app = express();

mongoose.connect('mongodb://localhost:27017/movie_api', { useNewUrlParser: true, useUnifiedTopology: true });


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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

app.get('/movies', (req, res) => {
  res.json(movies);
});
// Gets the data about a single movies, by name

app.get('/movies/:title', (req, res) => {
  const { title } = req.params;
  const movie = movies.find( movie => title === movie.Title );

  if (movie) {
      return res.status(200).json(movie);
  } else {
    res.status(400).send('no such movie')
  }

});

// Gets the data about a genre by name
app.get('/movies/genre/:genreName', (req, res) => {
  const { genreName } = req.params;
  const genre = movies.find( movie => movie.Genre === genreName );

  if (genre) {
      return res.status(200).json(genre);
  } else {
    res.status(400).send('no such genre')
  }

});
//Gets the data about a director by name

app.get('/movies/director/:directorName', (req, res) => {
  Movies.findOne({ directorName: req.params.directorName })
  .then((movie) => {
    res.json(movie);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

//Gets data of all users
app.get('/users', (req, res) => {
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
app.get('/users/:Username', (req, res) => {
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
app.post('/users', (req, res) => {
  Users.findOne({ Username: req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + 'already exists');
      } else {
        Users
          .create({
            Username: req.body.Username,
            Password: req.body.Password,
            Email: req.body.Email,
            Birthday: req.body.Birthday
          })
          .then((user) =>{res.status(201).json(user) })
        .catch((error) => {
          console.error(error);
          res.status(500).send('Error: ' + error);
        })
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

//allow users to update username
app.put('/users/:Username', (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, { $set:
    {
      Username: req.body.Username,
      Password: req.body.Password,
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
app.post('/users/:Username/movies/:MovieID', (req, res) => {
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
app.delete('/users/:Username/movies/:MovieID', (req, res) => {
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
app.delete('/users/:Username', (req, res) => {
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

app.listen(8080, () => {
  console.log('Your app is listening on port 8080');
});
