import React from 'react'
import { Link } from 'react-router-dom'

const PlanPage = () => {


    const dietPlans = [{planName: "Get fit",goal: "lose weight",duration: "3-6 months"},{planName: "Get strong",goal: "maintain weight",duration: "3 months"},{planName: "Get big",goal: "gain weight",duration: "6 months"},{planName: "locked in",goal: "get shredded",duration: "???"},]

  return (
    <div>
        <h2>Choose your diet plan:</h2>
        <div>
            {dietPlans.map((item) => (
                <div key={item.planName}>
                    <h3>{item.planName}</h3>
                    <p>GOAL: {item.goal}</p>
                    <p>TIME: {item.duration}</p>
                    <button>Start !</button>
                </div>
            ))}
        </div>
        <Link to={"/"}>Go back</Link>
    </div>
  )
}

export default PlanPage