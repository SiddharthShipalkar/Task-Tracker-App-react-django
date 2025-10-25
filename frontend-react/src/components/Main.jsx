import React from 'react'
import Button from './Button'

const Main = () => {
  return (
    <>
    <div className='container'>
      <div className='p-5 text-center bg-light-dark'>
        <h1>Task Tracker App</h1>
        <p className='lead'>info related to App</p>
        <Button text="Login" class="btn btn-outline-info" url='/login'/> 
      </div>

    </div>
    </>

  )
}

export default Main