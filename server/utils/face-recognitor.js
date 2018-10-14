import fs from 'fs'
import faceRecognition from 'face-recognition'
import path from 'path'

const fr = faceRecognition
const detector = fr.FaceDetector()

// Loads a presaved model from ./model.json
const modelPath = process.env.NODE_ENV === 'production' ?
  'model.json' :
  './server/utils/model.json'

const model = JSON.parse(fs.readFileSync(modelPath))

const recognizer = fr.FaceRecognizer()
recognizer.load(model)

// size of the detected faces in pixels (rectangles)
const size = 150


// Predicts the players in a picture
export const whoIsIt = imagePath => {

  // Load image from path
  const image = fr.loadImage(path.resolve(imagePath))

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
