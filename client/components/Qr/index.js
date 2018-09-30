import './index.css'
import React from 'react'
import QrCode from 'qrcode.react'

export default ({ value }) => (
  <div className="Qr">
    <QrCode
      value={ value }
      renderAs="svg"
    />
    <span>Add match</span>
  </div>
)
