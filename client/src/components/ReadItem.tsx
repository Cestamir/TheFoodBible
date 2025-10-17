import { useEffect, useState } from 'react'
import EditFoodItem from './EditFoodItem';
import EditRecipeItem from './EditRecipeItem';
import { isFoodItem,isRecipeItem } from '../utils/types';
import type { Item } from '../utils/types';
import ItemDisplay from './ItemDisplay';




interface ItemDetailProps {
  itemId: string;
  items: Item[];
  onUpdate: (item: Item) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
  onSelectItem: (id : string) => void;
}
const ReadItem = ({items,itemId,onClose,onDelete,onUpdate,onSelectItem} : ItemDetailProps) => {

    const [recipeItems,setRecipeItems] = useState<Item[]>([]);
    const [unmatchedItems,setUnmatchedItems] = useState<string[]>([]);

    const item = items.find((item) => item._id === itemId)

    const token = localStorage.getItem("token");

    function saveUnmatchedIngredients(){
        let unmatchedlist : any = [];
        if(recipeItems && item && isRecipeItem(item)){
            for(let i=0;i< item.ingredients.length;i++){
                const itemIngredient = item.ingredients[i]

                const match = recipeItems.find((recipe) => recipe.title === itemIngredient)
                if(!match){
                    unmatchedlist.push(itemIngredient)
                }
            }
        }
        return unmatchedlist;
    }

    // setting the items of an item, which are already as foods in db
    useEffect(() => {
        const loadRecipeFoods = async () => {
            try{
            if(item && isRecipeItem(item)){
                    const filteredIngredients : Item[] = item.ingredients.map((ingredient) => showIngredientBasedOnName(ingredient)).filter((result) : result is Item[] => Array.isArray(result)).flat();
                    const otherItems = saveUnmatchedIngredients();
                    setUnmatchedItems(otherItems)
                    setRecipeItems(filteredIngredients);
            }

            }catch(err){
                console.log(err)
            }
        }
        loadRecipeFoods();
    },[item])


    const [readDisplay,setReadDisplay] = useState({display: 'block'})


    if(!item){
        return (<div>Item not found.</div>)
    }


    // handles modification of the item selected
    const [isEditClicked,setIsEditClicked] = useState<boolean>(false);

    function testRecipeValues(){
        console.log(item)
    }



    const handleDelete = async (id : string) => {
        let isConfirmed = confirm(`Are you sure you want to delete ${item?.title} ?`);

        if(!isConfirmed) return;
        if(isRecipeItem(item)){
            try {
                const res = await fetch(`/api/recipes/${id}`,{method: "DELETE",headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`}})
                if(res.ok){
                console.log("recipe deleted")
                } else {
                    alert("cannot delete selected item.")
                    return;
                }
            } catch (error) {
                console.log(error)
            }
        } else if (isFoodItem(item)){
            try {
                const res = await fetch(`/api/foods/${id}`,{method: "DELETE",headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`}})
                if(res.ok){
                console.log("food deleted")
                } else {
                    alert("cannot delete selected item.")
                    return;
                }
            } catch (error) {
                console.log(error)
            }
            
        }
        setReadDisplay({display: "none"})
        onDelete(itemId)
    }

    const handleEdit = () => {
        setIsEditClicked((prev) => !prev)
        console.log(item)
    }

    // functions for checking and displaying the ingredeints in recipes

    function checkForIngredient(ingredient : string,ingredientInDb : string){
        if(ingredient.includes(ingredientInDb)){
            return ingredientInDb;
        }
    }

    function showIngredientBasedOnName(ingredientName: string){
        const foodIngredients = items.filter((item) => item.title === checkForIngredient(ingredientName,item.title))
        if(foodIngredients){
            return foodIngredients;
        } else {
            return;
        }
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
            {isRecipeItem(item) && 
            <div>
                {item.instructions}
                {/* ingredients in recipes */}
                <div>
                    {recipeItems.map((recipeItem) => {
                        return <ItemDisplay key={recipeItem._id} itemToDisplay={recipeItem} onToggle={() => onSelectItem(recipeItem._id)}/>})}
                    {unmatchedItems.map((item) => (
                        <div key={item}>{item}</div>
                    ))}
                </div>
            </div>}
            <button onClick={() => testRecipeValues()}>click</button>
            <button onClick={() => handleEdit()}>CHANGE</button>
            <button onClick={() => handleDelete(itemId)}>DELETE</button>
        </div>)}
    </div>
  )
}

export default ReadItem