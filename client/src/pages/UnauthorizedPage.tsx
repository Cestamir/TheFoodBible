import React from 'react'
import { Link } from 'react-router-dom'

const UnauthorizedPage = () => {
  return (
    <div className='pagewrap'>
        UnauthorizedPage
        <Link to={"/"}>Go back</Link>
    </div>
  )
}

export default UnauthorizedPage