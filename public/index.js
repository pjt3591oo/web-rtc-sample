// const video = document.getElementById('mung');
const socket = io('wss://localhost');
const videoGrid = document.getElementById('mung');
const myPeer = new Peer();
const myVideo = document.createElement('video');
myVideo.muted = true;
const peers = {};
let myStream;
let calls;
let uid;

navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: false,
  }).then((stream) => {
    console.log('my stream id: ', stream.id);
    addVideoStream(myVideo, stream);
    myStream = stream;
    // 다른 유저가 스트림 요청
    // 다른 유저가 스트림 요청할 때 본인의 스트림을 보내줌
    myPeer.on('call', (call) => { 
      
      const video = document.createElement('video');

      // 유저가 스트림 요청할 때 본인의 스틀림을 받아서 화면에 출력
      call.on('stream', (stream) => {
        console.log('stream', stream);
        addVideoStream(video, stream);
      });

      call.answer(stream);  // 스트림 전달
    });


    socket.on('user-connected', (userId) => {
      connectToNewUser(userId, stream);
    });
  });

socket.on('user-disconnected', (userId) => {
  if (peers[userId]) peers[userId].close();
});

myPeer.on('open', (userId) => {
  const roomId = 10;
  uid = userId;
  console.log(`[ON] open: ${userId}`);
  
  socket.emit('join-room', roomId, userId);
});

// 유저가 접속하면 user-connected에서 호출
function connectToNewUser(userId, stream) {
  
  // 접속한 유저에게 스트림 요청
  // 요청할 때 본인의 스트림을 전달한다.
  const call = myPeer.call(userId, stream); 
  const video = document.createElement('video');
  
  // call 대상이 answer()로 응답한 스트림을 전달받아서 화면에 출력
  call.on('stream', (userVideoStream) => { // userId에게 stream을 받음
    addVideoStream(video, userVideoStream); // 유저에게 받은 stream을 화면에 출력
  });

  call.on('close', () => {
    video.remove();
  });

  peers[userId] = call;
}

myPeer.on('connection', function(conn) {
  console.log('connection');
  // conn.on('data', function(data){
  //   // Will print 'hi!'
  //   console.log(data);
  // });
});

// 화면공유
async function shareScreen(e) {
  const screenStream = await navigator.mediaDevices.getDisplayMedia({
    video: true,
    audio: false
  })
  console.log('screenStream', uid)
  // myPeer.call(uid, screenStream); 
  Object.keys(peers).forEach(peer => {
    peers[peer].call(uid, screenStream)
  })
  // const sender = calls.getSenders().find(s => {
  //   console.log(s.track.kind, screenStream);
  //   return s.track.kind === 'video'
  // });
  
  
  // sender.replaceTrack(screenStream.getVideoTracks()[0]);
  // addVideoStream(myVideo, screenStream)
}

function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => {
    video.play();
  });
  video.setAttribute('data-peer-id', stream.id);
  videoGrid.append(video);
}

document.getElementById('screen-share').addEventListener('click', shareScreen);