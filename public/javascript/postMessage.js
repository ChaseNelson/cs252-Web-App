function postData(uid) {
  const message   = document.getElementById('messageContent').value;
  const timestamp = Date.now();

  let messRef = firebase.database().ref('Messages/' + uid);
  let data = {message: message, likes: 0};
  messRef.child(timestamp).set(data);
  document.getElementById('messageContent').value = '';
}
