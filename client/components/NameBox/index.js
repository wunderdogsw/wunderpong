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
    { number && (
      <NumberBox glossy={ topThree || king }>
        { `${number} ` }
      </NumberBox>
    )}
    { children }
  </ShadowBox>
)
