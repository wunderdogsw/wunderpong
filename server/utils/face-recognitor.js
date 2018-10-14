import fs from 'fs'
import cv from 'opencv4nodejs'
import faceRecognition from 'face-recognition'

const fr = faceRecognition.withCv(cv)
const detector = fr.FaceDetector()

// Loads a presaved model from ./model.json
const modelPath = process.env.NODE_ENV === 'production' ?
  'model.json' :
  './server/utils/model.json'

console.log(modelPath)

const model = JSON.parse(fs.readFileSync(modelPath))
console.log(model)

const recognizer = fr.FaceRecognizer()
recognizer.load(model)

// size of the detected faces in pixels (rectangles)
const size = 150


// Predicts the players in a picture
export const whoIsIt = imageBuffer => {

  // Use opencv4nodejs to convert buffer image to correct format
  // if dependencies are too heavey then fr.loadImage(path) can be used
  // and opencv4nodejs dependency can be dropped
  const imageCv = fr.CvImage(cv.imdecode(imageBuffer))
  const image = fr.cvImageToImageRGB(imageCv)

  const rects = detector.locateFaces(image, size).map(mrect => mrect.rect)
  if ( !rects.length ) return []

  const faces = detector.getFacesFromLocations(image, rects, size)
  if ( !faces.length ) return []


  const players = faces

    // Get faces
    .map(face => recognizer.predictBest(face))

    // Map rect data to faces
    .map((face, i) => ({
      ...face,
      ...rects[i],
    }))

    // Sort array so leftmost face is first
    .sort((a, b) => b.right - a.right)

    // Add name
    .map(player => ({
      ...player,
      name: player.className,
    }))

  return players
}
