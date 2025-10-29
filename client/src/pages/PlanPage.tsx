import React from 'react'
import { Link } from 'react-router-dom'
import type { RootState } from '../reduxstore/store';
import { useSelector } from 'react-redux';


const PlanPage = () => {


    const {diets} = useSelector((state: RootState) => state.diet);

  return (
    <div id='planpage'>
        <h2>Choose your diet plan:</h2>
        <div>
            {diets.length < 1 ? <p>Loading..</p> : diets.map((diet) => (
                <div key={diet.planName}>
                    <h3>{diet.planName}</h3>
                    <p>GOAL: {diet.goal}</p>
                    <p>TIME: {diet.duration} days</p>
                    <button className='btn'>Start !</button>
                </div>
            ))}
        </div>
        <Link to={"/"}>Go back</Link>
    </div>
  )
}

export default PlanPage