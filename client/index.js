import 'babel-polyfill'
import './index.css'
import React, { Fragment } from 'react'
import ReactDom from 'react-dom'

import Hero from 'Client/components/Hero'
import Ladder from 'Client/components/Ladder'

const App = () => (
  <Fragment>
    <Hero />
    <Ladder />
  </Fragment>
)

ReactDom.render(<App />, document.getElementById('root'))
