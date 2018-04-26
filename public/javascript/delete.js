function deleteAccount() {
  const email    = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  const promise = firebase.auth().signInWithEmailAndPassword(email, password);

  promise.catch(err => {
    console.error(err.message);
  });

  let bool = true;

  firebase.auth().onAuthStateChanged((user) => {
    if (user && user.email === email && bool) {
      firebase.database().ref('Users').child(uid).set({}), (err) => {
        firebase.database().ref('Messages').child(uid).set({});
        bool = false;
        firebase.auth().currentUser.delete();
        window.location.assign =  window.location.hostname;
      }
    }
  })
}
