import { useState } from 'react'
import EditFoodItem from './EditFoodItem';
import EditRecipeItem from './EditRecipeItem';
import { isFoodItem,isRecipeItem } from './types';
import type { Item } from './types';



interface ItemDetailProps {
  itemId: string;
  items: Item[];
  onUpdate: (item: Item) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}
const ReadItem = ({items,itemId,onClose,onDelete,onUpdate} : ItemDetailProps) => {

    const [readDisplay,setReadDisplay] = useState({display: 'block'})

    const item = items.find((item) => item._id === itemId)

    if(!item){
        return (<div>Item not found.</div>)
    }

    const [isEditClicked,setIsEditClicked] = useState<boolean>(false);

    function testRecipeValues(){
        console.log(item)
    }



    const handleDelete = async (id : string) => {
        let isConfirmed = confirm(`Are you sure you want to delete ${item?.title} ?`);

        if(!isConfirmed) return;
        const isItem = isFoodItem(item);
        console.log(isItem)
        if(isRecipeItem(item)){
            const res = await fetch(`/api/recipes/${id}`,{method: "DELETE"})
            if(res.ok){
                console.log("recipe deleted")
            }
        } else if (isFoodItem(item)){
            const res = await fetch(`/api/foods/${id}`,{method: "DELETE"})
            if(res.ok){
                console.log("food deleted")
            }
        }
        setReadDisplay({display: "none"})
        onDelete(itemId)
    }

    const handleEdit = () => {
        setIsEditClicked((prev) => !prev)
        console.log(item)
    }

  return (
    <div id='readitem' style={readDisplay}>
        <button onClick={() => {setReadDisplay({display: "none"});onClose()}}>❌ BACK</button>
        {isEditClicked  ? ( isFoodItem(item) ?  <EditFoodItem onSave={
            (updatedItem) => {
                onUpdate(updatedItem)
                onClose()
                setIsEditClicked(false)
            }
        } onCancel={() => setIsEditClicked(false)} itemToDisplay={item} /> : <EditRecipeItem onSave={
            (updatedItem) => {
                onUpdate(updatedItem)
                onClose()
                setIsEditClicked(false)
            }
        } onCancel={() => setIsEditClicked(false)} itemToDisplay={item}/> ) : (<div>
            {isFoodItem(item) && <div>{item.foodType}</div>}
            {isRecipeItem(item) && <div>{item.instructions}</div>}
            <button onClick={() => testRecipeValues()}>click</button>
            <button onClick={() => handleEdit()}>CHANGE</button>
            <button onClick={() => handleDelete(itemId)}>DELETE</button>
        </div>)}
    </div>
  )
}

export default ReadItem