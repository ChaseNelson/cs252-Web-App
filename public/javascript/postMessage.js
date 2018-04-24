const config = {
    apiKey: "AIzaSyBrJCE5BVlXicolinRD8Vl5omPA0wiq4R4",
    authDomain: "cs252-web-app.firebaseapp.com",
    databaseURL: "https://cs252-web-app.firebaseio.com",
    projectId: "cs252-web-app",
    storageBucket: "cs252-web-app.appspot.com",
    messagingSenderId: "225077387827"
  };
firebase.initializeApp(config);

function postData(uid) {
  const message   = document.getElementById('messageContent').value;
  const timestamp = Date.now();

  let messRef = firebase.database().ref('Messages/' + uid);
  let data = {message: message, likes: 0};
  messRef.child(timestamp).set(data);
  document.location.reload(false);
}
