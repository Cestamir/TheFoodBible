import React, { useState } from 'react'
import type {foodFace} from './LandingPage'
import type {recipeFace} from './LandingPage'

function isFood(obj: any) : obj is foodFace{
    return obj;
}

function isRecipe(obj: any) : obj is recipeFace{
    return obj;
}

interface ComponentProps {
  itemToDisplay: foodFace | recipeFace;
}

const ReadItem : React.FC<ComponentProps> = ({itemToDisplay}) => {

    const [readDisplay,setReadDisplay] = useState({display: 'block'})

    function testRecipeValues(){
        console.log(itemToDisplay)
    }

    const food = isFood(itemToDisplay);
    const recipe = isRecipe(itemToDisplay);

  return (
    <div id='readitem' style={readDisplay}>
        {food && <div>{itemToDisplay.foodType}</div>}
        {recipe && <div>{itemToDisplay.instructions}</div>}
        {<button onClick={() => setReadDisplay({display: "none"})}>❌</button>}
        {<button onClick={() => testRecipeValues()}>click</button>}
    </div>
  )
}

export default ReadItem