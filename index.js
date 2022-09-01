const express = require ('express');
const app = express();


let topMovies = [
    {
    Name: "in Progress"
    }
];

app.get('/movies', (req, res) => {
    res.json(topMovies);
  });

  app.get('/', (req, res) => {
    res.send('This Movie Collection will blow your mind!');
  });

  app.use('/documentation.html', express.static('public'));

  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something isn"t loading right :(!');
  });

  app.listen(8080, () => {
    console.log("Your app is listening on port 8080.");
    });