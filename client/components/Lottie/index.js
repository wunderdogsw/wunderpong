import './index.css'

import React, { Component } from 'react'
import classNames from 'classnames'
import lottie from 'lottie-web'

class Lottie extends Component {
  dom = null
  lottie = null
  delayTimeout = null

  componentDidMount() {
    const {
      delay,
      autoplay = true,
      ...lottieProps
    } = this.props

    this.lottie = lottie.loadAnimation({
      container: this.dom,
      renderer: 'svg',
      loop: true,
      autoplay: autoplay ? delay ? false : true : false,
      ...lottieProps,
    })

    if (typeof this.props.lottie === 'function') {
      this.props.lottie(this.lottie)
    }

    if (autoplay && delay) {
      this.delayTimeout = setTimeout(() => {
        this.lottie.play()
      }, delay)
    }

  }

  componentWillUnmount() {
    clearTimeout(this.delayTimeout)
    this.delayTimeout = null
  }

  render() {
    return (
      <div
        className={ classNames('Lottie', this.props.className) }
        ref={dom => this.dom = dom}
      />
    )
  }
}

export default Lottie
