const socket = io('/')
const videoGrid = document.getElementById('video-grid')
let myPeer = null

let myVideoStream;
const myVideo = document.createElement('video')
myVideo.muted = true;
let peers = {}
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
  myPeer = new Peer(undefined, {
      // host: '/',
      host: 'ed30-183-82-154-211.ngrok.io',
      // path: '6531-183-82-157-189.ngrok.io',
      port: '443',
      // port: '3001',
      secure: true
})
myVideoStream = stream;

addVideoStream(myVideo, stream)
myPeer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id)

    socket.emit('database',ROOM_ID,id,sessionStorage.getItem("Name"))
})

myPeer.on('call', call => {
    call.answer(stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream)
    })
})
socket.on('user-connected', userId => {
    console.log("new user connected", userId)
    connectToNewUser(userId, stream)
})

let text = $("input");
// when press enter send message
$('html').keydown(function (e) {
if (e.which == 13 && text.val().length !== 0) {
    socket.emit('message', text.val(), sessionStorage.getItem('Name'));
    text.val('')
}
});
socket.on("createMessage", (message, name) => {
    $("ul").append(`<li class="message"><b>`+name+`</b><br/>${message}</li>`);
    // scrollToBottom()
})

}).catch(error=>{
    console.log("Error: ",error)
})

socket.on('user-disconnected', userId => {
  if (peers[userId]) 
    peers[userId].close()
})

socket.on('participants', (num) => {
    document.getElementById('parti').innerHTML = num;
})

socket.on("put", text => {
  document.getElementById('random').innerHTML = text;
})

function show_hide(){
  console.log("hello! clicked me!?");
  var x = document.getElementById("righty");
  x.style.display = "none";
  var x = document.getElementById("right");
  x.style.display = "block";
  
}

function show__hide(){
  var x = document.getElementById("right");
  x.style.display = "none";
  var x = document.getElementById("righty");
  x.style.display = "block";
  socket.emit('now');
}

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream)
  const video = document.createElement('video')
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream)
  })
  call.on('close', () => {
    video.remove()
  })

  peers[userId] = call
}

function addVideoStream(video, stream) {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  videoGrid.append(video)
}



const scrollToBottom = () => {
  var d = $('.main__chat_window');
  d.scrollTop(d.prop("scrollHeight"));
}


const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
}

const playStop = () => {
  console.log('object')
  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo()
  } else {
    setStopVideo()
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
}

const setMuteButton = () => {
  const html = `
    <i class="fas fa-microphone"></i>
    <span>Mute</span>
  `
  document.querySelector('.main__mute_button').innerHTML = html;
}

const setUnmuteButton = () => {
  const html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>
  `
  document.querySelector('.main__mute_button').innerHTML = html;
}

const setStopVideo = () => {
  const html = `
    <i class="fas fa-video"></i>
    <span>Stop Video</span>
  `
  document.querySelector('.main__video_button').innerHTML = html;
}

const setPlayVideo = () => {
  const html = `
  <i class="stop fas fa-video-slash"></i>
    <span>Play Video</span>
  `
  document.querySelector('.main__video_button').innerHTML = html;
}

