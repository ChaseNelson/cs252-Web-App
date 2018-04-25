function postData(uid) {
  const message   = document.getElementById('messageContent').value;
  const timestamp = Date.now();

  if (message === '') return;

  let messRef = firebase.database().ref('Messages/' + uid);
  let data = {message: message, likes: 0, timestamp: timestamp};
  messRef.push(data);
  document.getElementById('messageContent').value = '';
}

function incLike(uid, messKey, currLikes){
  console.log('userId :: ', uid);
  console.log('Message Key :: ', messKey);
  console.log('likes :: ', currLikes);
  let likeRef = firebase.database().ref('Messages').child(uid).child(messKey);
  let data = {likes: parseInt(currLikes) + 1};
  likeRef.update(data);
}
