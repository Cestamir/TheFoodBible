import { useEffect, useState } from 'react'
import EditFoodItem from './EditFoodItem';
import EditRecipeItem from './EditRecipeItem';
import { isFoodItem,isRecipeItem } from '../utils/types';
import type { Item } from '../utils/types';
import ItemDisplay from './ItemDisplay';
import { useSelector } from 'react-redux';
import type { RootState } from '../reduxstore/store';

interface ItemDetailProps {
  itemId: string;
  items: Item[];
  onUpdate: (item: Item) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
  onSelectItem: (id : string) => void;
}
const ReadItem = ({items,itemId,onClose,onDelete,onUpdate,onSelectItem} : ItemDetailProps) => {


    const {isAuthenticated,role} = useSelector((state: RootState) => state.auth);

    const [recipeItems,setRecipeItems] = useState<Item[]>([]);
    const [unmatchedItems,setUnmatchedItems] = useState<string[]>([]);

    const item : any = items.find((item) => item._id === itemId)

    const token = localStorage.getItem("token");

    function saveUnmatchedIngredients(){
        let unmatchedlist : any = [];
        if(recipeItems && item && isRecipeItem(item)){
            for(let i=0;i< item.ingredients.length;i++){
                const itemIngredient = item.ingredients[i]

                const match = recipeItems.find((recipe : any) => recipe.title === itemIngredient)
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
        let isConfirmed = confirm(`Are you sure you want to delete item with id:  ${item?._id} ?`);

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
        const foodIngredients = items.filter((item) =>{
            if(isRecipeItem(item)){
                item.title === checkForIngredient(ingredientName,item.title)
            } else if(isFoodItem(item)){
                item.name === checkForIngredient(ingredientName,item.name)
            }
        })
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
            {isFoodItem(item) && 
            // item is type of food
            <div>
                <h2>{item.name}</h2>
                <h3>{item.foodType}</h3>
                {item.fdcId ? <h4>{item.fdcId}</h4> : <h4>No fdcId.</h4>}
                {item.imageUrl != null ? <div>
                <img width={32} height={32} src={item.imageUrl}/>
                </div> : <div>🥗</div>}

                {item.wikiUrl ? <h4>Wiki url :{<a target="_blank" rel="noreferrer noopener" href={item.wikiUrl}>{item.wikiUrl}</a>}</h4> : <h4>No Wiki url.</h4>}
                <div style={{width: "200px",height: "200px",overflowY: "scroll"}}>
                    {item.nutrition?.length ? item.nutrition.map((nutrient) => (
                        <span key={nutrient.name} style={{display: "block"}}>{nutrient.name} {nutrient.value}{nutrient.unit}</span>
                    )) : <p>No nutrients available.</p>}
                </div>
                {role === "admin" ? <div>
                    Date created: {item.createdAt.toString()},
                    Author: {item.author}
                </div> : null}
            </div>}
            {isRecipeItem(item) && 
            // item is type of recipe
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
            {role === "admin" ? <button onClick={() => handleEdit()}>CHANGE</button> : null}
            {role === "admin" ? <button onClick={() => handleDelete(itemId)}>DELETE</button> : null}
        </div>)}
    </div>
  )
}

export default ReadItem