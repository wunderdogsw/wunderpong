import './index.css'
import React, { Component } from 'react'
import { getLadder } from 'Client/api'
import NameBox from 'Client/components/NameBox'
import Lottie from 'Client/components/Lottie'

import lottieCrown from './crown.json'

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
    let ladder = await getLadder()
    ladder.map(player => player.name.replace(/_/gi, ' '))
    this.setState({ ladder })
    this.ladderTimeout = setTimeout(this.getLadder, 10000)
  }  

  render() {
    const { ladder } = this.state

    if (!ladder.length) return <div className="Ladder" />

    const [ first, second, third, ...rest ] = this.state.ladder

    return (
      <div className="Ladder">
        <ol>
          <div className="Ladder__topThree">
            <li>
              <NameBox
                number="1."
                king
                player={ first }
                key={ first }
              />
            </li>
            <li>
              <NameBox
                number="2."
                topThree
                player={ second }
                key={ second }
              />
            </li>
            <li>
              <NameBox
                number="3."
                topThree
                player={ third }
                key={ third }
              />
            </li>
          </div>
          <div className="Ladder__rest">
            { rest.map((name, i) => (
              <li key={ i + name }>
                <NameBox
                  number={ `${i + 4}.` }
                  player={ name }
                />
              </li>
            ))}
          </div>
        </ol>
        <Lottie
          animationData={ lottieCrown }
        />
      </div>
    )
  }
}
