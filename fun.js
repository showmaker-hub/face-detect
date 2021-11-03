const video=document.getElementById("video");

const startVideo=()=>{
    navigator.getUserMedia(
        {video:{}},
        (stream) => (video.srcObject = stream),
        (err)=>console.log(err)
    );
};

Promise.all([
   
  faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.faceExpressionNet.loadFromUri('/models'),
   ]).then(startVideo());
  
    video.addEventListener('play', () => {
      // 制作定位 canvas
      const canvas = document.createElement('canvas');
      canvas.style.position = 'absolute';
      document.body.append(canvas);
    
      // 配置显示尺寸
      const displaySize = { width: video.width, height: video.height };
      faceapi.matchDimensions(canvas, displaySize);
    
      // 每 100ms 去绘制
      setInterval(async () => {
        // 识别位置, 脸部特征, 表情
        const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceExpressions();
    
        // 调整尺寸
        const resizedDetections = faceapi.resizeResults(detections, displaySize);
  
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height); // 清空画布
        faceapi.draw.drawDetections(canvas, resizedDetections); // 位置
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections); // 脸部特征  
        faceapi.draw.drawFaceExpressions(canvas, resizedDetections); // 表情
      }, 100);
    });
    