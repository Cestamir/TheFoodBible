import React from 'react'
import { Link } from 'react-router-dom'

const UnauthorizedPage = () => {
  return (
    <div className='pagewraper'>
        UnauthorizedPage
        <Link to={"/"}>Go back</Link>
    </div>
  )
}

export default UnauthorizedPage