import './index.css'
import React, { Component, createRef } from 'react'
import Webcam from "react-webcam"
import { postScreenshot } from 'Client/api'
import ContentBox from 'Client/components/ContentBox'

const SCREENSHOT_INTERVAL = 1000

export default class PlayerCamera extends Component {

  state = {
    players: [],
  }
  mounted = false
  cameraRef = createRef()
  screenshotTimeout = null
  userMedia = false

  componentDidMount() {
    this.mounted = true
    this.screenshot()
  }

  componentWillUnmount() {
    this.mounted = false
    clearTimeout(this.screenshotTimeout)
  }

  handleUserMedia = () => {
    this.userMedia = true
  }

  screenshot = async () => {
    if ( !this.mounted ) return
    if ( !this.userMedia) {
      this.screenshotTimeout = setTimeout(this.screenshot, SCREENSHOT_INTERVAL)
      return
    }

    const screenshot = this.cameraRef.current.getScreenshot()
    try {
      const res = await postScreenshot(screenshot)
      this.setState({
        players: res.players,
      })
    } catch(err) {}

    this.screenshotTimeout = setTimeout(this.screenshot, SCREENSHOT_INTERVAL)
  }




  render() {
    const videoConstraints = {
      width: 1280,
      height: 800,
      facingMode: "user"
    }
    const { players } = this.state

    const enoughPlayers = players.length >= 2

    return (
      <div className="PlayerCamera PlayerCamera--active">
        <ContentBox>
          <Webcam
            ref={ this.cameraRef }
            onUserMedia={ this.handleUserMedia }
            videoConstraints={ videoConstraints }
            audio={ false }
          />

          <div className="PlayerCamera__titleContainer">
            <span className="PlayerCamera__title">Winner</span>
            { enoughPlayers && (
              <span className="PlayerCamera__playerName">
                { players[0].name }
              </span>
            )}
          </div>

          <div className="PlayerCamera__titleContainer">
            <span className="PlayerCamera__title">Loser</span>
            { enoughPlayers && (
              <span className="PlayerCamera__playerName">
                { players[1].name }
              </span>
            )}
          </div>
        </ContentBox>
      </div>
    )
  }
}


/*

const canvas = document.getElementById('facephoto')
document.getElementById('detectedname').innerHTML = null

canvas.width  = video.offsetWidth
canvas.height = video.offsetHeight

const tempcontext = canvas.getContext("2d"),
tempScale = (canvas.height/canvas.width)

tempcontext.drawImage(
	video,
	0, 0,
	video.offsetWidth, video.offsetHeight
)

$.post( "/whoisit", {image: canvas.toDataURL( 'image/png' )}, function(data) {
	console.log("Post success: ", data)
	document.getElementById('detectedname').innerHTML = "IT IS " + data.playerName.className
})

*/
