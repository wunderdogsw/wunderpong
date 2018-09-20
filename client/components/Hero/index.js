import './index.css'
import React from 'react'
import Lottie from 'Client/components/Lottie'

import lottieHero from './hero.json'

export default () => (
  <div className="Hero">
    <h1>Table Tennis Smashdown</h1>
    <Lottie animationData={ lottieHero } />
  </div>
)
