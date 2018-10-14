import './index.css'
import React, { Component, Fragment, createRef } from 'react'
import classNames from 'classnames'
import Webcam from "react-webcam"
import { postScreenshot, postMatch } from 'Client/api'
import ContentBox from 'Client/components/ContentBox'

const SCREENSHOT_INTERVAL = 3000
const CONFIRM_TIME = 11000

export default class PlayerCamera extends Component {

  state = {
    players: [],
    timerTime: 0,
    sendingMatch: false,
    matchMessage: '',
  }
  mounted = false
  cameraRef = createRef()
  playerTimeout = null
  userMedia = false
  timerStartedAt = 0
  timerInterval = null

  componentDidMount() {
    this.mounted = true
    this.playerLoop()
  }

  componentWillUnmount() {
    this.mounted = false
    this.stopTimer()
    this.stopPlayerLoop()
  }

  handleUserMedia = () => {
    this.userMedia = true
  }

  playerLoop = async () => {
    // Cancel if not mounted
    if ( !this.mounted ) return

    // Wait if no usermedia or currently sending a match
    if ( !this.userMedia || this.state.sendingMatch ) {
      this.playerTimeout = setTimeout(this.playerLoop, SCREENSHOT_INTERVAL)
      return
    }

    const players = await this.fetchPlayers()
    const playersChanged = this.playersChanged(players)

    if (playersChanged && players.length === 2) {
      this.stopTimer()
      this.startTimer()
    }

    if (players.length !== 2) {
      this.stopTimer()
    }

    if (!this.mounted) return

    this.setState({
      players,
    })

    this.playerTimeout = setTimeout(this.playerLoop, SCREENSHOT_INTERVAL)
  }

  stopPlayerLoop = () => {
    clearTimeout(this.playerTimeout)
  }

  fetchPlayers = async () => {
    const screenshot = this.cameraRef.current.getScreenshot()
    try {
      const res = await postScreenshot(screenshot)
      const { players } = res
      return players
    } catch(err) { console.log(err) }
    return []
  }

  playersChanged = nextPlayers => {
    const lastPlayerNames = this.state.players.map( x => x.name ).join('')
    const nextPlayerNames = nextPlayers.map( x => x.name ).join('')
    return lastPlayerNames !== nextPlayerNames
  }

  startTimer = () => {
    this.timerStartedAt = Date.now()
    this.timerInterval = setInterval(this.handleTimer, 100)
  }

  stopTimer = () => {
    this.timerStartedAt = 0
    clearInterval(this.timerInterval)
    this.timerInterval = null
    if (this.mounted) this.setState({ timerTime: 0 })
  }

  handleTimer = () => {
    this.setState({
      timerTime: Date.now() - this.timerStartedAt
    }, () => {
      const { timerTime } = this.state
      if (timerTime >= CONFIRM_TIME) {
        this.stopTimer()
        this.sendMatch()
      }
    })
  }

  sendMatch = async () => {
    if (!this.mounted) return

    this.setState({
      sendingMatch: true,
      matchMessage: 'Saving...',
    })

    // Last check before sending
    const players = await this.fetchPlayers()
    const playersChanged = this.playersChanged(players)

    if (!this.mounted) return

    if (playersChanged) {
      console.log('players changed, canceling match send')
      this.setState({
        sendingMatch: false,
        matchMessage: '',
      })
      return
    }

    let matchMessage = 'Failed to save :('
    try {
      const names = players.map(x => x.name)
      await postMatch(names[0], names[1])
      matchMessage = `Got it, ${names[0]} won ${names[1]}!`
    } catch(err) {
      console.log(err)
    }

    setTimeout(() => {
      if (!this.mounted) return
      this.setState({
        matchMessage,
      }, () => {
        setTimeout(() => {
          if (!this.mounted) return
          this.setState({
            sendingMatch: false,
            matchMessage: '',
          })
        }, 5000)
      })
    }, 2000)
  }

  render() {
    const videoConstraints = {
      width: 1280 / 2,
      height: 800 / 2,
      facingMode: 'user',
    }
    const { players, timerTime, sendingMatch, matchMessage } = this.state

    const active = !!players.length
    const big = players.length >= 2
    const timer = timerTime > 0

    return (
      <div className={ classNames(
        'PlayerCamera',
        active && 'PlayerCamera--active',
        big && 'PlayerCamera--big',
        timer && !sendingMatch && 'PlayerCamera--timer',
        sendingMatch && 'PlayerCamera--sendingMatch',
      )}>
        <ContentBox>
          <Webcam
            ref={ this.cameraRef }
            onUserMedia={ this.handleUserMedia }
            videoConstraints={ videoConstraints }
            screenshotFormat="image/jpeg"
            audio={ false }
          />

          <div className="PlayerCamera__timer">
            <span>Adding in</span>
            { Math.round((CONFIRM_TIME - timerTime) / 1000) }
          </div>

          <div className="PlayerCamera__matchMessage">
            { matchMessage }
          </div>

          { big && (
            <Fragment>
              <div className="PlayerCamera__titleContainer">
                <span className="PlayerCamera__title">Winner</span>
                <span className="PlayerCamera__playerName">
                  { players[0].name }
                </span>
              </div>
              <div className="PlayerCamera__titleContainer">
                <span className="PlayerCamera__title">Loser</span>
                <span className="PlayerCamera__playerName">
                  { players[1].name }
                </span>
              </div>
            </Fragment>
          )}

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
