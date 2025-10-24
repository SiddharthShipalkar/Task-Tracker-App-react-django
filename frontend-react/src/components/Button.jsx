import React from 'react'

const Button = (props) => {
  return (
    <>
          <a className={`btn ${props.class}`} herf="#">{props.text}</a>

    </>
  )
}

export default Button