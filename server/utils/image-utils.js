import fs from 'fs'

const UPLOADS_DIR = './uploads/'



const createUploadsDir = () => {
  if (!fs.existsSync(UPLOADS_DIR)){
    fs.mkdirSync(UPLOADS_DIR)
  }
}

export const saveImage = async imageBuffer => new Promise((resolve, reject) => {
  createUploadsDir()
  const imageName = `screenshot_${Date.now()}.jpg`
  const imagePath = `${UPLOADS_DIR}${imageName}`
  fs.writeFile(imagePath, imageBuffer,  err => {
    if (err) return reject(err)
    resolve(imagePath)
  })
})

export const removeImage = imagePath => {
  if (!fs.existsSync(UPLOADS_DIR)) return

  return fs.unlinkSync(imagePath)
}
