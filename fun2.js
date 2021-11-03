const image=document.getElementById("image");

(async () => {
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('./model'),
    faceapi.nets.faceLandmark68Net.loadFromUri('./model'),
    faceapi.nets.faceRecognitionNet.loadFromUri('./model'),
    faceapi.nets.faceExpressionNet.loadFromUri('./model'),
    faceapi.nets.ageGenderNet.loadFromUri('./model'),
  ]);
  const processAsync = async (image) => {
    const imageContainer = image.parentElement;
    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.left = '0';
    canvas.style.top = '0';
    imageContainer.append(canvas);
    const displaySize = { width: image.width, height: image.height };
    faceapi.matchDimensions(canvas, displaySize);

    const faceDetection = (
      await faceapi
        .detectAllFaces(image, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptors()
        .withFaceExpressions()
        .withAgeAndGender()
    )[0]; // 假设图片只会有一张脸
    // 或者用 detectSingleFace 拿最像脸的脸, 提醒: withFaceDescriptor <- 没有 s 了
    // const faceDetection = await faceapi
    //   .detectSingleFace(image, new faceapi.TinyFaceDetectorOptions())
    //   .withFaceLandmarks()
    //   .withFaceDescriptor()
    //   .withFaceExpressions()
    //   .withAgeAndGender();

    if (faceDetection === undefined) {
      throw new Error(`no faces detected`);
    }
    const resizedDetection = faceapi.resizeResults(faceDetection, displaySize);
    faceapi.draw.drawDetections(canvas, resizedDetection);
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetection);
    faceapi.draw.drawFaceExpressions(canvas, resizedDetection);
    const box = resizedDetection.detection.box;
    const drawBox = new faceapi.draw.DrawBox(box, {
      label: Math.round(resizedDetection.age) + ' year old ' + resizedDetection.gender,
    });
    drawBox.draw(canvas);
    return faceDetection;
  };
  const [fd1, fd2] = await Promise.all([
    processAsync(document.querySelector<HTMLImageElement>('#js-image1')),
    processAsync(document.querySelector<HTMLImageElement>('#js-image2')),
  ]);

  const distance = faceapi.euclideanDistance(fd1.descriptor, fd2.descriptor);
  if (distance < 0.6) {
    console.log('same person');
  } else {
    console.log('different person');
  }
})();