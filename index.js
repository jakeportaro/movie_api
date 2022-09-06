const express = require('express'),
  bodyParser = require('body-parser'),
  uuid = require('uuid');

const app = express();

app.use(bodyParser.json());

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
    favoriteMovies: []
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
  const { directorName } = req.params;
  const director = movies.find( movie => movie.Director === directorName );

  if (director) {
      return res.status(200).json(director);
  } else {
    res.status(400).send('no such director')
  }

});

//Gets Data of user by user ID
app.get('/users/:id', (req, res) => {
  console.log(users);
  const { id } = req.params;
  console.log('id is: ' + id);
  const user = users.find( user => user.id.toString === id );
  console.log(user)
  if (user) {
      return res.status(200).json(user);
  } else {
    res.status(400).send('no such user ID')
  }

});

//Allow new users to register
app.post('/users', (req, res)=> {
    const newUser = req.body;

    if (newUser.name) {
        newUser.id = uuid.v4();
        users.push(newUser);
        res.status(201).json(newUser)
    } else {
        res.status(400).send('users need names')
    }
});

//allow users to update username
app.put('/users/:id', (req, res)=> {
    const { id } = req.params;
    const updatedUser = req.body;

    let user = users.find( user => user.id == id);

    if (user) {
        user.name = updatedUser.name;
        res.status(200).json(user);
    } else {
        res.status(400).send('no such user')
    }
});





// Adds data for a new movie to our list of favorite movies for a users.
app.post('/users/:id/:movieTitle', (req, res) => {
    const { id, movieTitle } = req.params;

  let user = users.find( user => user.id == id );

  if (user) {
     user.favoriteMovies.push(movieTitle);
     res.status(200).send(`${movieTitle} has been added to user ${id}'s array`);;

     res.status(400).send('no such user')
}});

// Deletes a movie from our list by ID
app.delete('/users/:id/:movieTitle', (req, res) => {
    const {id, movieTitle } = req.params

    let user = users.find( user => user.id == id);
  if (user) {
      user.favoriteMovies = user.favoriteMovies.filter( title => title !== movieTitle);
      res.status(200).send(`${movieTitle} has been removed from user ${id}'s array`);;
  } else {
    res.status(400).send('no such user')
  }
});

//Allow user to unregister
app.delete('/users/:id/', (req, res) => {
  const {id} = req.params

  let user = users.find( user => user.id == id);
if (user) {
    users = users.filter( user => user.id != id);
    res.status(200).send(`user ${id} has been deleted`);;
} else {
  res.status(400).send('no such user')
}
});

app.listen(8080, () => {
  console.log('Your app is listening on port 8080');
});
