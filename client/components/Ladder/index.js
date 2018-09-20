import './index.css'
import React, { Component } from 'react'
import { getLadder } from 'Client/api'
import NameBox from 'Client/components/NameBox'

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
                children={ first }
              />
            </li>
            <li>
              <NameBox
                number="2."
                topThree
                children={ second }
              />
            </li>
            <li>
              <NameBox
                number="3."
                topThree
                children={ third }
              />
            </li>
          </div>
          <div className="Ladder__rest">
            { rest.map((name, i) => (
              <li key={ i + name }>
                <NameBox
                  number={ `${i + 4}.` }
                  children={ name }
                />
              </li>
            ))}
          </div>
        </ol>
      </div>
    )
  }
}
