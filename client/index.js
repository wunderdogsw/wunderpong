import 'babel-polyfill'
import './index.css'
import React, { Fragment } from 'react'
import ReactDom from 'react-dom'
import { BrowserRouter, Switch, Route } from 'react-router-dom'

import Hero from 'Client/components/Hero'
import ContentBox from 'Client/components/ContentBox'
import Ladder from 'Client/components/Ladder'
import NewMatch from 'Client/components/NewMatch'

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
          </Fragment>
        )}
      />
    </Switch>
  </BrowserRouter>
)

ReactDom.render(<App />, document.getElementById('root'))
