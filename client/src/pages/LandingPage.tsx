import React from 'react'
import { Link } from 'react-router-dom'

const LandingPage = () => {
  return (
    <div>
        <h2>Welcome to the food app for your needs!</h2>
        <Link to={"/home"}>Search food/recipe</Link>
        <Link to={"/diet"}>Choose a diet plan</Link>
        <Link to={"/contact"}>Contact me ?</Link>
    </div>
  )
}

export default LandingPage