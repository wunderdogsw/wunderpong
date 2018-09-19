import 'babel-polyfill'
import './index.css'
import React, { Fragment } from 'react'
import ReactDom from 'react-dom'

import Hero from 'Client/components/Hero'
import ContentBox from 'Client/components/ContentBox'
import Ladder from 'Client/components/Ladder'

const App = () => (
  <Fragment>
    <Hero />
    <ContentBox>
      <Ladder />
    </ContentBox>
  </Fragment>
)

ReactDom.render(<App />, document.getElementById('root'))
