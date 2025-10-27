import React from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import type { RootState } from '../reduxstore/store'

const LandingPage = () => {

  const {role,isAuthenticated} = useSelector((state: RootState) => state.auth);

  return (
    <div className='pagewraper'>
      <div id='landingpage'>
        <h1>Welcome to the food app for your needs!</h1>
        <Link to={"/home"}>Food guide</Link>
        {(role === "admin" || role === "user") ? <Link to={"/diet"}>Diet plan</Link> : null}
        {!role ? <Link to={"/login"}>Make an account</Link> : null}
        <Link to={"/contact"}>Contact me here XX</Link>
      </div>
        {/* WORK TO DO:
        - complete the permissions for actions on the webapp ✅
        - Scrape better data for food to basic food like (apple,chocolate,meat,tofu,tomatoes)
        - Scrape better recipe data to contain basic food elements etc.
        - Upgrade users to have available food in their account based on which they can display recipes that can be made 
        - add at least 3 categories for diets (vegetarian,carnivous,basic) ✅
        - complete at least 3 diet-workout plans and provide recomended food and exercise
        - make the UI beatiful */}
    </div>
  )
}

export default LandingPage