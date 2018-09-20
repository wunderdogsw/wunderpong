import './index.css'
import React from 'react'
import classNames from 'classnames'
import ShadowBox from 'Client/components/ShadowBox'

export default ({ children, glossy }) => (
  <ShadowBox className={classNames(
    'NumberBox',
    glossy && 'NumberBox--glossy'
  )}>
    { children }
  </ShadowBox>
)
