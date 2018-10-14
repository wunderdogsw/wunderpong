import './index.css'
import React from 'react'

export default ({ children }) => (
  <div className="ContentBox">
    <span className="ContentBox__staple" />
    <span className="ContentBox__staple" />
    <span className="ContentBox__staple" />
    <span className="ContentBox__staple" />
    { children }
  </div>
)
