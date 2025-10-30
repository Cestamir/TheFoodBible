import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import type { RootState } from '../reduxstore/store'

{/*
WORK TO DO:

- Add BMI calculator
- Scrape better data for protein foods
- Scrape more recipe data 
- Make new fitness plans, add more properties and criteria
- upgrade the UI beatiful 

*/}

const LandingPage = () => {

  const {role,isAuthenticated} = useSelector((state: RootState) => state.auth);

  return (
    <div className='pagewraper'>
      <div id='landingpage'>
        <h1>Welcome to the foodguide app of your needs! 🍏</h1>
        <Link to={"/home"}>Browse foods 🍎</Link>
        {(role === "admin" || role === "user") ? <Link to={"/diet"}>Select a fitness diet plan 🍌</Link> : null}
        {!role ? <Link to={"/login"}>Make new account ✍️</Link> : null}
        <Link to={"/contact"}>Contact 📞</Link>
      </div>
    </div>
  )
}

export default LandingPage