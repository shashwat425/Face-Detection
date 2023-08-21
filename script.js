const video = document.getElementById('video')


// to run all asynchronous call in parallel
Promise.all([
  //a normal face detector, but it is smaller and quicker
  //so it will run in real time in browser as opposed to being very slow
  faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
  
  //It is going to able to register the different parts of our faces 
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),

  //Going to able to allow the API to recognize my face in the box
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),

  //recognize my face expressions(smile, angry, frow, surprised, neutral...)
  faceapi.nets.faceExpressionNet.loadFromUri('/models')
]).then(startVideo)


//to hook our webcam to our video element
function startVideo() {
  navigator.getUserMedia(
    { video: {} },  //video as an empty object
    stream => video.srcObject = stream,   
    //essentially what is coming from our webcam set as source of our video
    err => console.error(err)
    // if we get an error we just console log
  )
}

video.addEventListener('play', () => {
  const canvas = faceapi.createCanvasFromMedia(video)
  document.body.append(canvas)
  const displaySize = { width: video.width, height: video.height }
  faceapi.matchDimensions(canvas, displaySize)
  setInterval(async () => {
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
    const resizedDetections = faceapi.resizeResults(detections, displaySize)
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    faceapi.draw.drawDetections(canvas, resizedDetections)
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
  }, 100)
})