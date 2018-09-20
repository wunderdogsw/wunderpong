import './index.css'
import React from 'react'
import classNames from 'classnames'
import NumberBox from 'Client/components/NumberBox'
import ShadowBox from 'Client/components/ShadowBox'

export default ({ children, number, topThree, king }) => (
  <ShadowBox className={classNames(
    'NameBox',
    topThree && 'NameBox--topThree',
    king && 'NameBox--king',
  )}>
    { children }
    { number && (
      <NumberBox glossy={ topThree }>
        { number }
      </NumberBox>
    )}
  </ShadowBox>
)
