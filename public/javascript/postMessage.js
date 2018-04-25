function postData(uid) {
  const message   = document.getElementById('messageContent').value;
  const timestamp = Date.now();

  if (message === '') return;

  let messRef = firebase.database().ref('Messages/' + uid);
  let data = {message: message, likes: 0, timestamp: timestamp};
  messRef.push(data);
  document.getElementById('messageContent').value = '';
}

function incLike(uid, messKey, myUid){
  let likeRef = firebase.database().ref('Messages').child(uid).child(messKey);
  likeRef.once('value', (data) =>{
    let val = data.val();
    if (typeof val.likers === 'undefined') {
      let likers = [];
      likers.push(myUid)
      likeRef.update({likers: likers, likes: likers.length});
    } else if (val.likers.indexOf(myUid) === -1) {
      val.likers.push(myUid)
      let d = {likers: val.likers, likes: val.likers.length};
      console.log(d);
      likeRef.update(d);
    }
  })
}
