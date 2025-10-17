import React from 'react'
import { Link } from 'react-router-dom'

const LandingPage = () => {
  return (
    <div>
        <h2>Welcome to the food app for your needs!</h2>
        <Link to={"/home"}>Search food/recipe</Link>
        <Link to={"/diet"}>Choose a diet plan</Link>
        <Link to={"/contact"}>Contact me ?</Link>
        {/* WORK TO DO:
        - complete the permissions for actions on the webapp ✅
        - Scrape better data for food to basic food like (apple,chocolate,meat,tofu,tomatoes)
        - Scrape better recipe data to contain basic food elements etc.
        - Upgrade users to have available food in their account based on which they can display recipes that can be made
        - add at least 3 categories for diets (vegetarian,carnivous,basic)
        - complete at least 3 diet-workout plans and provide recomended food and exercise
        - make the UI beatiful */}
    </div>
  )
}

export default LandingPage