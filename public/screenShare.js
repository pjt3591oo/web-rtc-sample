
async function main() {
  try {
    let stream = await navigator.mediaDevices.getDisplayMedia({
      video: false,
      audio: false,
    })
  
    const myVideo = document.createElement('video');
    addVideoStream(myVideo, stream);
  } catch(err) {
    console.log('Error: ' + err);
  }
}

function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => {
    video.play();
  });

  const videoGrid = document.getElementById('mung');
  videoGrid.append(video);
}

main();