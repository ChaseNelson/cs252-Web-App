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

function userLoggedin(sess) {
  // console.log("Sess :: " + sess.userId);
  if (typeof sess.userId == 'undefined') {
    return false;
  }
  let Uref = firebase.database().ref('Users');
  Uref.on('value', (data) => {
    data = data.val()
    // console.log(typeof data[sess.userId] !== 'undefined');
    if (typeof data[sess.userId] !== 'undefined') return true;
    return false;
  }, (err) => {
    console.error('Error!');
    console.error(err);
  });
}

app.get('/', (req, res) => {
  if (typeof req.query.err !== 'undefined' && req.query.err == 1) {
    res.render('home', {error: req.query.err});
  } else {
    res.render('home');
  }
});

app.get('/newUser', (req, res) => {
  res.render('newUser');
});

app.get('/logout', (req, res) => {
  res.redirect(303, '/');
  req.session.userId = "";
});

app.get('/settings', (req, res) => {
  let user = userLoggedin(req.session);
  if (user === false) {
    res.redirect(303, '/');
  } else {
    let uref = firebase.database().ref('Users/' + req.session.userId);
    uref.on('value', (data) => {
      let val = data.val();
      res.render('settings', {myUid: req.session.userId, firstName: val.firstName, lastName: val.lastName, email: val.email});
    }, (err) =>{
      console.error('Error!');
      console.error(err);
    })
  }
});

app.get('/profile/:uid', (req, res) => {
  // TODO: Verfify that user is loged in
  // firebase.database().ref('Users');
  let user = userLoggedin(req.session);
  if (user === false) {
    res.redirect(303, '/');
  } else {
    let uref = firebase.database().ref('Users/' + req.session.userId);
    uref.on('value', (data) => {
      let val = data.val();
      let messRef = firebase.database().ref('Messages/' + req.params.uid);
      messRef.on('value', (data) => {
        let v = data.val();
        let arr = [];
        let mRef = firebase.database().ref('Users/' + req.params.uid);
        mRef.on('value', (data) => {
          for (let key in v) {
            arr.push({content: v[key].message, likes: v[key].likes, firstName: data.val().firstName, lastName: data.val().lastName, uid: req.params.uid});
          }
          let info = {myUid: req.session.userId, firstName: val.firstName, lastName: val.lastName, email: val.email, messages: arr}
          res.render('profile', info);
        });
      })
    }, (err) =>{
      console.error('Error!');
      console.error(err);
    })
  }
});

app.get('/feed', (req, res) => {
  let user = userLoggedin(req.session);
  if (user === false) {
    res.redirect(303, '/');
  } else {
    let uref = firebase.database().ref('Users/' + req.session.userId);
    uref.on('value', (data) => {
      let val = data.val();
      let info = {myUid: req.session.userId, firstName: val.firstName, lastName: val.lastName};
      res.render('feed', info);
    });
  }
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const pass  = req.body.password;
  const auth  = firebase.auth();

  const promise = auth.signInWithEmailAndPassword(email, pass);
  promise.catch(err =>  {
    console.error(err.message);
    return res.redirect(303, '/?err=' + 1);
  });

  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      // User is signed in.
      let sess = req.session;
      let name, email, uid;
      name     = user.displayName;
      email    = user.email;
      uid      = user.uid;
      sess.userId = uid;
      res.redirect(303, '/feed');
    }
  });
});

app.post('/createUser', (req, res) => {
  const email = req.body.email;
  const pass  = req.body.password;
  const auth  = firebase.auth();

  const promise = auth.createUserWithEmailAndPassword(email, pass);
  promise.catch(err => console.error(err.message));

  firebase.auth().onAuthStateChanged(firebaseUser => {
    if (firebaseUser) {
      // console.log(firebaseUser.uid);
      // console.log(firebaseUser.email);
      let userRef = firebase.database().ref('Users');
      let data = {email: firebaseUser.email, firstName: req.body.firstName, lastName: req.body.lastName};
      userRef.child(firebaseUser.uid).set(data);
    } else {
      console.log('not logged in');
    }
  });
  res.redirect(303, '/');
});

app.post('/updateUser', (req, res) => {
  const uid       = req.body.uid;
  const firstName = req.body.firstName;
  const lastName  = req.body.lastName;

  let userRef = firebase.database().ref('Users');
  let data = {firstName: firstName, lastName: req.body.lastName};
  userRef.child(uid).update(data);
  res.redirect(303, '/settings');
});



app.get('/message', (req, res) => {
  res.render('message');
})

app.post('/newComment', (req, res) => {
  /* TODO :: Add ability to make comments */
  /* this should work in theory BUT it has yet to be tested */
  const messUid       = req.body.messUid;
  const commUid       = req.session.userId;
  const comment       = req.body.comment;
  const messTimestamp = req.body.timestamp;
  const commTimestamp = Date.now();

  if (typeof commUid === 'undefined') {
    res.redirect(303, '/');
  } else if (typeof messUid === 'undefined') {
    res.redirect(303, '/profile/' + commUid);
  } else if (typeof comment === 'undefined' || comment === '\n' || comment === '' || comment === ' ') {
    res.redirect(303, '/profile/' + messUid);
  } else {
    let commRef = firebase.database().ref('Messages/' + messUid + '/' + messTimestamp);
    let data = {comment: comment};
    commRef.child(commTimestamp).set(data);
    res.redirect(303, '/profile/' + messUid);
  }
});

app.use((req, res) => {
  res.type('text/html');
  res.status(404);
  res.render('404');
});


app.listen(app.get('port'), () => {
  console.log("Express started on http://localhost:" + app.get('port') + "\nPress Ctrl+C to terminate.");
});
