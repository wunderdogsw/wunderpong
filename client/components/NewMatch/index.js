import './index.css'
import React, { Component } from 'react'
import { getPlayers, postMatch } from 'Client/api'
import ContentBox from 'Client/components/ContentBox'
import PlayerSelect from 'Client/components/PlayerSelect'


export default class extends Component {
  state = {
    players: [],
    winner: null,
    loser: null,
    addWinner: false,
    addLoser: false,
    clearHaxCozTired: 0,
  }

  componentDidMount = async () => {
    let players = await getPlayers()
    players = players.map(x => x.replace(/_/gi, ' '))
    this.setState({ players })
  }

  handleSelect = e => {
    const { target } = e
    this.setState({
      [target.name]: target.value
    })
  }

  handleForm = async e => {
    e.preventDefault()
    const { sending, winner, loser } = this.state

    if ( sending ) return false

    if (!winner || !winner.trim()) return alert('Add winner, please')
    if (!loser || !loser.trim()) return alert('Please, add loser')
    this.setState({ sending: true })
    const res = await postMatch(winner, loser)
    this.setState({
      sending: false,
      winner: null,
      loser: null,
      addWinner: false,
      addLoser: false,
      clearHaxCozTired: this.state.clearHaxCozTired + 1,
    })
    alert(res.text)
  }

  toggleInput = e => {
    e.preventDefault()
    const { target } = e
    this.setState({
      [target.name]: !this.state[target.name]
    })

    if (target.name === 'addLoser') this.setState({ loser: '' })
    if (target.name === 'addWinner') this.setState({ winner: '' })

  }

  render() {
    const {
      players,
      addWinner,
      addLoser,
      sending,
      clearHaxCozTired,
    } = this.state
    return (
      <div className="NewMatch">
        <ContentBox>
          <h1>Table Tennis Smashdown</h1>
          <h2>Add Match</h2>
          <form onSubmit={ this.handleForm } key={ clearHaxCozTired }>
            <label>
              <span>
                Winner
                <a
                  href="#"
                  name="addWinner"
                  onClick={ this.toggleInput }
                  children="+"
                  className={ addWinner ? 'active' : null}
                />
              </span>
              <PlayerSelect
                name="winner"
                players={ players }
                onChange={ this.handleSelect }
                useText={ addWinner }
              />
            </label>
            <label>
              <span>
                Loser
                <a
                  href="#"
                  name="addLoser"
                  onClick={ this.toggleInput }
                  children="+"
                  className={ addLoser ? 'active' : null}
                />
              </span>
              <PlayerSelect
                name="loser"
                players={ players }
                onChange={ this.handleSelect }
                useText={ addLoser }
              />
            </label>
            <button>{ sending ? 'Sending' : 'Save'}</button>
          </form>
        </ContentBox>
      </div>
    )
  }
}
