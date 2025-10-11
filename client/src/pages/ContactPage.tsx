import React from 'react'
import { Link } from 'react-router-dom'

const ContactPage = () => {
  return (
    <div>
        <h2>Telefon: </h2>
        <h2>Email: cestmirpavlasek@gmail.com </h2>
        <h2>Github: </h2>
        <Link to={"/"}>Go back</Link>
    </div>
  )
}

export default ContactPage