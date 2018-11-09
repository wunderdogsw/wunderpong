import 'babel-polyfill'
import './index.css'
import React, { Fragment } from 'react'
import ReactDom from 'react-dom'
import { BrowserRouter, Switch, Route } from 'react-router-dom'

import Hero from 'Client/components/Hero'
import ContentBox from 'Client/components/ContentBox'
import Ladder from 'Client/components/Ladder'
import NewMatch from 'Client/components/NewMatch'
import Qr from 'Client/components/Qr'

import PlayerCamera from 'Client/components/PlayerCamera'

const App = () => (
  <BrowserRouter>
    <Switch>
      <Route
        path="/match"
        component={ NewMatch }
      />
      <Route
        path="*"
        render={() => (
          <Fragment>
            <Hero />
            <ContentBox>
              <Ladder />
            </ContentBox>
            <Qr value={ `${window.location}match`} />
            <PlayerCamera />
          </Fragment>
        )}
      />
    </Switch>
  </BrowserRouter>
)

ReactDom.render(<App />, document.getElementById('root'))
