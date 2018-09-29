import './index.css'
import React from 'react'

export default ({
  players = [],
  name,
  useText,
  onChange,
  defaultOption = "-",
}) => {
  if ( useText ) {
    return (
      <input
        className="PlayerSelect"
        type="text"
        name={ name }
        onChange={ onChange }
        placeholder="Type a name"
      />
    )
  }

  return (
    <select
      className="PlayerSelect"
      onChange={ onChange }
      name={ name }
    >
      <option value="">{ defaultOption }</option>
      { players.map(x => (
        <option key={x}>{x}</option>
      ))}
    </select>
  )
}
