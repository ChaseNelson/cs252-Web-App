/* Middle Ware */
const express    = require('express');
const fs         = require('fs');
const path       = require('path');
const formidable = require('formidable');
const multer     = require('multer');
const multiparty = require('multiparty');

/* Setup Express */
let app = express();

app.disable('x-powered-by');

/* Setup Handlebars */
const handlebars = require('express-handlebars').create({defaultLayout:'main'});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

/* Setup Firebase */
const firebase = require('firebase').initializeApp({
  apiKey: "AIzaSyBrJCE5BVlXicolinRD8Vl5omPA0wiq4R4",
  authDomain: "cs252-web-app.firebaseapp.com",
  databaseURL: "https://cs252-web-app.firebaseio.com",
  projectId: "cs252-web-app",
  storageBucket: "cs252-web-app.appspot.com",
  messagingSenderId: "225077387827"
});

let ref = firebase.database().ref();

app.use(require('body-parser').urlencoded({extended:true}));

app.set('port', process.env.PORT || 3000);
app.use(express.static(__dirname + '/public'));

app.use((req, res, next) => {
  console.log("looking for URL : " + req.url);
  next();
});

app.use((err, req, res, next) => {
  console.log("Error : " + err.message);
  next();
});

app.get('/', (req, res) => {
  res.render('home');
});

app.get('/newUser', (req, res) => {
  res.render('newUser');
});

app.post('/login', (req, res) => {
  console.log(req.body.email);
  console.log(req.body.pass);
  res.redirect(303, '/');
});

app.post('/createUser', (req, res) => {
  console.log(req.body.firstName);
  console.log(req.body.lastName);
  console.log(req.body.email);
  console.log(req.body.password);
  res.redirect(303, '/');
});

app.use((req, res) => {
  res.type('text/html');
  res.status(404);
  res.render('404');
});


app.listen(app.get('port'), () => {
  console.log("Express started on http://localhost:" + app.get('port') + "\nPress Ctrl+C to terminate.");
});
