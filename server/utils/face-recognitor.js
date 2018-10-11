const cv = require('opencv4nodejs')
const fr = require('face-recognition').withCv(cv);

// Predicts the players in a picture
export const whoIsIt = (imageBuffer) => {
    // Loads a presaved model from ./model.json
    const model = JSON.parse(fs.readFileSync('./server/utils/model.json'));
    const recognizer = fr.FaceRecognizer()
    recognizer.load(model);

    // Use opencv4nodejs to convert buffer image to correct format
    // if dependencies are too heavey then fr.loadImage(path) can be used
    // and opencv4nodejs dependency can be dropped
    const imageCv = fr.CvImage(cv.imdecode(imageBuffer))
    const image = fr.cvImageToImageRGB(imageCv)

    const detector = fr.FaceDetector()
    // size of the detected faces in pixels (rectangles)
    const size = 150

    // Assume 2 faces in image
    const rects = detector.locateFaces(image, size).map(mrect => mrect.rect);
    const faces = detector.getFacesFromLocations(image, rects, targetSize);

    if (faces.length < 2) throw new Error('Could not find 2 faces in image');
    if (faces.length > 2) throw new Error('Found more than 2 faces in image');

    faces.map(face => recognizer.predictBest(face));

    // Rightmost face is loser, left is winner
    return rects[0].right > rects[1].right ? {
      winner: faces[0],
      loser: faces[1]
    } : {
      winner: faces[1],
      loser: faces[0]
    }
};
