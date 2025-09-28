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

  return (
    <div id='readitem' style={readDisplay}>
        {isFood(itemToDisplay) ? 
        <div>
            {itemToDisplay.title}
            {itemToDisplay.url}
        </div> : null}
        {isRecipe(itemToDisplay) ? <div>
            {itemToDisplay.title}
            {itemToDisplay.url}
            {itemToDisplay.cookTime}
        </div> : null}
        {<button onClick={() => setReadDisplay({display: "none"})}>❌</button>}
    </div>
  )
}

export default ReadItem