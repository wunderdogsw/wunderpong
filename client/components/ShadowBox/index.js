import './index.css'
import React from 'react'
import classNames from 'classnames'

export default ({ className, ...props}) => (
  <div { ...props }
    className={ classNames(className, 'ShadowBox') } 
  />
)
