import React from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import type { RootState } from '../reduxstore/store'

const ContactPage = () => {

  const {isAuthenticated,role} = useSelector((state: RootState) => state.auth);

  return (
    <div className='pagewraper'>
      <h2>Hello this webapp was made by Cestmir Pavlasek, here you can find contact information to get in touch.</h2>
      <div id='contactinfo'>
        <h2>Linkedin: </h2>
        <a href='https://www.linkedin.com/in/cestmir-pavlasek-4bb741382/'>https://www.linkedin.com/in/cestmir-pavlasek-4bb741382/</a>
        <h2>Email: </h2>
        <a href='#'>cestmirpavlasek@gmail.com</a>
        <h2>Github: </h2>
        <a href="https://github.com/Cestamir">https://github.com/Cestamir</a>
        {!role ? <Link to={"/login"}>Make your account</Link> : null}
      </div>
    </div>
  )
}

export default ContactPage