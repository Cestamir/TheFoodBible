import React from 'react'

import type { foodFace } from './LandingPage'
import type { recipeFace } from './LandingPage'

interface ComponentProps {
  itemToDisplay: foodFace | recipeFace;
}

function isFood(obj: any) : obj is foodFace{
    return obj;
}

function isRecipe(obj: any) : obj is recipeFace{
    return obj;
}


const Item : React.FC<ComponentProps> = ({itemToDisplay}) => {

    // need to fix the type, currently only showing same properties of 2 types
    const food = isFood(itemToDisplay);
    const recipe = isRecipe(itemToDisplay);

    function displayItem(it : any){
        console.log(it)
    }

  return (
    <div className='search-item' onClick={() => displayItem(itemToDisplay)}>
        {food &&  <div>{itemToDisplay.title}</div>}
        {recipe && <div>{itemToDisplay.title}</div>}
    </div>
  )
}

export default Item