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

    const [ first, second, third, ...players ] = this.state.ladder

    const topThree = [first, second, third]
      .map(x => x ? x : ({
        name: '-',
        rating: '-'
      }))

    return (
      <div className="Ladder">
        <ol>
          <div className="Ladder__topThree">

            { topThree.map( (player, i) => (
              <li key={ `topthree${i}${player.name}` }>
                <NameBox
                  number={`${i + 1}.`}
                  king={ i === 0 }
                  topThree={ i !== 0 }
                  player={ player }
                />
              </li>
            ))}

          </div>
          <div className="Ladder__players">
            { players.map((name, i) => (
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
