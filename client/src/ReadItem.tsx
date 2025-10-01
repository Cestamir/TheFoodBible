import React, { useState } from 'react'
import type {foodFace} from './LandingPage'
import type {recipeFace} from './LandingPage'
import EditFoodItem from './EditFoodItem';
import EditRecipeItem from './EditRecipeItem';

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

    const [currentItem,setCurrentItem] = useState(itemToDisplay);

    const [isEditClicked,setIsEditClicked] = useState<boolean>(false);

    function testRecipeValues(){
        console.log(itemToDisplay)
    }

    const food = isFood(itemToDisplay);
    const recipe = isRecipe(itemToDisplay);




    const handleDelete = async (id : string) => {
        let isConfirmed = confirm(`Are you sure you want to delete ${currentItem?.title} ?`);
        if(currentItem?.instructions && isConfirmed){
            const res = await fetch(`/api/recipes/${id}`,{method: "DELETE"})
            if(res.ok){
                console.log("recipe deleted")
            }
        } else if (!currentItem?.instructions && isConfirmed){
            const res = await fetch(`/api/foods/${id}`,{method: "DELETE"})
            if(res.ok){
                console.log("food deleted")
            }
        }
        setReadDisplay({display: "none"})
    }

    const handleEdit = () => {
        setIsEditClicked((prev) => !prev)
        console.log(currentItem)
    }


    const handleData = (data : foodFace | recipeFace) => {
        if("cookTime" in data){
            return true;
        } else {
            return false;
        }
    }

  return (
    <div id='readitem' style={readDisplay}>
        <button onClick={() => setReadDisplay({display: "none"})}>❌ BACK</button>
        {isEditClicked && !handleData(itemToDisplay) ? <EditFoodItem itemToDisplay={currentItem} /> : isEditClicked && handleData(itemToDisplay) ? <EditRecipeItem itemToDisplay={currentItem}/> : <div>
            {food && <div>{itemToDisplay.foodType}</div>}
            {recipe && <div>{itemToDisplay.instructions}</div>}
            <button onClick={() => testRecipeValues()}>click</button>
            <button onClick={() => handleEdit()}>CHANGE</button>
            <button onClick={() => handleDelete(itemToDisplay._id)}>DELETE</button>
        </div>}
    </div>
  )
}

export default ReadItem