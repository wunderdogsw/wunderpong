import fs from 'fs'
import cv from 'opencv4nodejs'
import faceRecognition from 'face-recognition'

const fr = faceRecognition.withCv(cv)
const detector = fr.FaceDetector()

// Loads a presaved model from ./model.json
const model = JSON.parse(fs.readFileSync('./server/utils/model.json'))

const recognizer = fr.FaceRecognizer()
recognizer.load(model)

const size = 150


// Predicts the players in a picture
export const whoIsIt = imageBuffer => {


    // Use opencv4nodejs to convert buffer image to correct format
    // if dependencies are too heavey then fr.loadImage(path) can be used
    // and opencv4nodejs dependency can be dropped
    const imageCv = fr.CvImage(cv.imdecode(imageBuffer))
    const image = fr.cvImageToImageRGB(imageCv)

    // size of the detected faces in pixels (rectangles)

    // Assume 2 faces in image
    const rects = detector.locateFaces(image, size).map(mrect => mrect.rect)
    if ( !rects.length ) return []

    const faces = detector.getFacesFromLocations(image, rects, size)
    if ( !faces.length ) return []

    // if (faces.length < 2) throw new Error('Could not find 2 faces in image')
    // if (faces.length > 2) throw new Error('Found more than 2 faces in image')

    // const players = faces.map(face => recognizer.predictBest(face))



    const players = faces
      .map(face => recognizer.predictBest(face))
      .map((face, i) => ({
        ...face,
        ...rects[i],
      }))
      .sort((a, b) => b.right - a.right)
      .map(player => ({
        ...player,
        name: player.className,
      }))




    return players



    // return rects[0].right > rects[0].right ? {
    //   winner: players[0],
    //   loser: players[0]
    // } : {
    //   winner: players[0],
    //   loser: players[0]
    // }

    // Rightmost face is loser, left is winner
    // return rects[0].right > rects[1].right ? {
    //   winner: players[0],
    //   loser: players[1]
    // } : {
    //   winner: players[1],
    //   loser: players[0]
    // }
}
