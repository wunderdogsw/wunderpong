import './index.css'
import React, { Component } from 'react'
import { getLadder } from 'Client/api'

export default class extends Component {
  state = {
    ladder: []
  }

  ladderTimeout = null

  componentDidMount() {
    this.getLadder()
  }

  componentWillUnmount() {
    clearTimeout(this.ladderTimeout)
  }

  getLadder = async () => {
    const ladder = await getLadder()
    this.setState({ ladder })
    this.ladderTimeout = setTimeout(this.getLadder, 10000)
  }

  render() {
    return (
      <div className="Ladder">
        <ol>
          { this.state.ladder.map((name, i) => (
            <li key={i+name}>{ name } { i === 0 ? '👑' : '' }</li>
          ))}
        </ol>
      </div>
    )
  }
}
