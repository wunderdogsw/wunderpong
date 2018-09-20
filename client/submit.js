import 'babel-polyfill'
import './index.css'
import React, { Fragment } from 'react'
import ReactDom from 'react-dom'

const App = () => (
  <Fragment>
    Here we go
  </Fragment>
)

ReactDom.render(<App />, document.getElementById('root'))
