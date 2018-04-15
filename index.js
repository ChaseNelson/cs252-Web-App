/* Middle Ware */
const express    = require('express');
const fs         = require('fs');
const path       = require('path');
const formidable = require('formidable');
const multer     = require('multer');
const multiparty = require('multiparty');
const md5        = require('md5');
const session    = require('express-session');

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

/* Setup session */
app.use(session({
  secret: 'work hard',
  resave: true,
  saveUninitialized: false
}));

const ref = firebase.database().ref();

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

app.get('/profile', (req, res) => {
  res.render('profile');
});

app.get('/settings', (req, res) => {
  res.render('settings');
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const pass  = req.body.password;
  const auth = firebase.auth();

  const promise = auth.signInWithEmailAndPassword(email, pass);
  promise.catch(err =>  {
    console.error(err.message);
    return res.redirect(303, '/');
  });

  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      // User is signed in.
      let sess = req.session;
      let name, email, uid;
      name = user.displayName;
      email = user.email;
      uid = user.uid;
      console.log("user info { " + name + "\t" + email + "\t" + uid + " }");
      sess.userId = uid;
      console.log(sess);
      res.redirect(303, '/');
    }
  });
});

app.post('/createUser', (req, res) => {
  const email = req.body.email;
  const pass  = req.body.password;
  const auth = firebase.auth();

  const promise = auth.createUserWithEmailAndPassword(email, pass);
  promise.catch(err => console.error(err.message));

  firebase.auth().onAuthStateChanged(firebaseUser => {
    if (firebaseUser) {
      console.log(firebaseUser.uid);
      console.log(firebaseUser.email);
      // TODO: Make a new user in the user table
      let userRef = firebase.database().ref('Users');
      let data = {email: firebaseUser.email, firstName: req.body.firstName, lastName: req.body.lastName};
      userRef.child(firebaseUser.uid).set(data);
    } else {
      console.log('not logged in');
    }
  });
  res.redirect(303, '/');
});

app.post('/logout', (req, res) => {
  firebase.auth().signOut();
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
