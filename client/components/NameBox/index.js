import './index.css'
import React from 'react'
import classNames from 'classnames'
import NumberBox from 'Client/components/NumberBox'
import ShadowBox from 'Client/components/ShadowBox'

export default ({ player, number, topThree, king }) => (
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
    <span className="NameBox__name-container">{ player.name }</span>
    <span className="NameBox__rating-container">{ player.rating }</span>
  </ShadowBox>
)
