import { useEffect, useState } from 'react'
import EditFoodItem from './EditFoodItem';
import EditRecipeItem from './EditRecipeItem';
import { isFoodItem,isRecipeItem } from '../utils/types';
import type { foodFace, Item } from '../utils/types';
import ItemDisplay from './ItemDisplay';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../reduxstore/store';
import { isExpiredToken } from '../utils/types';
import { useNavigate } from 'react-router-dom';
import { addUserItem } from '../reduxstore/userItemsSlice';


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
    const {userItems,loading,error} = useSelector((state: RootState) => state.userItems)

    const [recipeItems,setRecipeItems] = useState<Item[]>([]);
    const [unmatchedItems,setUnmatchedItems] = useState<string[]>([]);

    const item : any = items.find((item) => item._id === itemId)

    const dispatch = useDispatch();
    const token = localStorage.getItem("token");
    const navigate = useNavigate();

    // function saveUnmatchedIngredients(){
    //     let unmatchedlist : any = [];
    //     if(recipeItems && item && isRecipeItem(item)){
    //         for(let i=0;i< item.ingredients.length;i++){
    //             const itemIngredient = item.ingredients[i]

    //             const match = recipeItems.find((recipe : any) => recipe.title === itemIngredient)
    //             if(!match){
    //                 unmatchedlist.push(itemIngredient)
    //             }
    //         }
    //     }
    //     return unmatchedlist;
    // }

    const findMatchingItems = (ingredientName: string) : Item | null => {
        const normalizedIngredient = ingredientName.toLowerCase().trim();
        const match = items.find((item) => {
            if(isFoodItem(item)){
                return item.name.toLowerCase().includes(normalizedIngredient) || normalizedIngredient.includes(item.name.toLowerCase());
            } else if (isRecipeItem(item)){
                return item.name.toLowerCase().includes(normalizedIngredient) || normalizedIngredient.includes(item.name.toLowerCase());
            }
            return false;
        })
        return match || null;
    }

    // setting the items of an item, which are already as foods in db
    useEffect(() => {
        const loadRecipeFoods = async () => {
            try{
            if(item && isRecipeItem(item)){
                const matchedItems: Item[] = [];
                const unmatched: string[] = [];

                item.ingredients.forEach((ingredient : string) => {
                    const match = findMatchingItems(ingredient);
                    if(match){
                        matchedItems.push(match)
                    } else {
                        unmatched.push(ingredient);
                    }
                })

                setRecipeItems(matchedItems)
                setUnmatchedItems(unmatched);

                console.log('Matched items:', matchedItems);
                console.log('Unmatched ingredients:', unmatched);

                    // const filteredIngredients : Item[] = item.ingredients.map((ingredient) => showIngredientBasedOnName(ingredient)).filter((result) : result is Item[] => Array.isArray(result)).flat();
                    // const otherItems = saveUnmatchedIngredients();
                    // setUnmatchedItems(otherItems)
                    // setRecipeItems(filteredIngredients);
            }

            }catch(err){
                console.log(err)
            }
        }
        loadRecipeFoods();
    },[item,items])


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

        const endpoint = isRecipeItem(item) ? `/api/recipes/${id}` : `/api/foods/${id}`;

            try {
                if(token && isExpiredToken(token)){
                    alert("expired token please login again.")
                    localStorage.removeItem("token");
                    localStorage.removeItem("role");
                    navigate("/")
                }
                const res = await fetch(endpoint,{method: "DELETE",headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`}})
                if(res.ok){
                
                setReadDisplay({display: "none"})
                onDelete(itemId)
                console.log(`${isRecipeItem(item) ? "Recipe" : "food"} deleted`)
                } else {
                    alert("cannot delete selected item.")
                    return;
                }
            } catch (error) {
                console.log(error)
            }
    }

    const handleEdit = () => {
        setIsEditClicked((prev) => !prev)
    }

    // // functions for checking and displaying the ingredeints in recipes

    // function checkForIngredient(ingredient : string,ingredientInDb : string){
    //     if(ingredient.includes(ingredientInDb)){
    //         return ingredientInDb;
    //     }
    // }

    // function showIngredientBasedOnName(ingredientName: string){
    //     const foodIngredients = items.filter((item) =>{
    //         if(isRecipeItem(item)){
    //             item.title === checkForIngredient(ingredientName,item.title)
    //         } else if(isFoodItem(item)){
    //             item.name === checkForIngredient(ingredientName,item.name)
    //         }
    //     })
    //     if(foodIngredients){
    //         return foodIngredients;
    //     } else {
    //         return;
    //     }
    // }


    // add food item to user acc

    const handleAddFoodToAccount = async (itemToAdd : foodFace) => {
        try {
            const foodExists =  userItems.find((item : foodFace) => item._id === itemToAdd._id)
            if(foodExists){
                return;
            }

            const res = await fetch(`/api/users/me/foods`,{method: "POST",headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },body: JSON.stringify({foodId: itemToAdd._id})})

            if(res.ok){
                dispatch(addUserItem(itemToAdd));
                console.log('food added to user account.')
            }

        } catch (err) {
            console.log(err,"failed to add food to user account")
        }
    }

  return (
    <div id='readitem' style={readDisplay}>
        <button className='smallbtn' onClick={() => {setReadDisplay({display: "none"});onClose()}}>❌</button>
        <button onClick={() => testRecipeValues()}>test</button>
        {role === "admin" ? <button className='btn' onClick={() => handleEdit()}>CHANGE</button> : null}
        {role === "admin" ? <button className='btn' onClick={() => handleDelete(itemId)}>DELETE</button> : null}
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
                {/* add food to acc */}
                {role === "admin" || role === "user" ? <button onClick={() => handleAddFoodToAccount(item)}>Add item to your account ➕</button> : null}
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
                <h2>{item.name}</h2>
                <div style={{overflowY:"scroll",height: "200px"}}>{item.instructions}</div>
                <div>Cooktime: {item.cookTime}</div>
                <div>Type of recipe: {item.diet}</div>
                <div>Url for recipe: <a href={item.url} target='_blank' rel="noreferrer noopener">{item.url}</a></div>
                {/* ingredients in recipes */}
                <div className='youritems'>
                    {recipeItems.length > 0 && recipeItems.map((recipeItem,i) => (
                        <ItemDisplay key={i+"i"} itemToDisplay={recipeItem} onToggle={() => onSelectItem(recipeItem._id)}/>))}
                    {unmatchedItems.length > 0 && unmatchedItems.map((item,i) => (
                        <div key={i}>{item}</div>
                    ))}
                </div>
            </div>}
        </div>)}
    </div>
  )
}

export default ReadItem