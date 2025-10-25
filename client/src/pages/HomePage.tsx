import { useEffect, useState } from 'react'
import ReadItem from '../components/ReadItem';
import AddRecipeItem from '../components/AddRecipeItem';
import AddFoodItem from '../components/AddFoodItem';
import ItemsDisplay from '../components/ItemsDisplay';
import ControlPanel from '../ControlPanel';
import { isExpiredToken, isFoodItem, isRecipeItem, type Item } from '../utils/types';
import type { foodFace,recipeFace } from '../utils/types';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../reduxstore/store';
import { addFood, addRecipe, deleteFood, deleteRecipe, updateFood, updateRecipe } from '../reduxstore/itemsSlice';


type DietType = "" | "all" | "carnivorous" | "vegetarian" | "fruitarian";

type items = foodFace | recipeFace;

const HomePage = () => {
    
    // Redux
    const dispatch = useDispatch();
    const {foods,recipes,loading} = useSelector((state: RootState) => state.items);

    // node server running test
    const [message,setMessage] = useState<string>("");
    useEffect(() => {
        fetch("/api/test")
        .then(res => res.json())
        .then(data => setMessage(data.message))
        .catch((err) => {
            console.error("error fetching data:",err)
        })
    },[]);
    // diet plans
    const [dietPlan,setDietPlan] = useState<DietType>("all");

    // input entered in search field
    const [searchedItem,setSearchedItem] = useState<string>("");

    // default item list, maybe assigning a value twice with the conjoined avriable above ?
    const itemsList = [...foods,...recipes];

    // storing the value of new item and display of the inputs to add it
    const [addItemClicked,setAddItemClicked] = useState<boolean>(false);
    const [addRecipeClicked,setAddRecipeClicked] = useState<boolean>(false);

    // functions to update the data on page
    const [selectedItemId,setSelectedItemId] = useState<string | null>(null);

    const updateItem = (updatedItem : Item) => {
        if(isRecipeItem(updatedItem)){
            dispatch(updateRecipe(updatedItem))
        } else if(isFoodItem(updatedItem)){
            dispatch(updateFood(updatedItem));
        }
    }

    const deleteItem = (deleteItemId : string) => {
        const item = itemsList.find((item) => item._id === deleteItemId)
        if(item){
            if(isFoodItem(item)){
                dispatch(deleteFood(deleteItemId))
            } else if(isRecipeItem(item)){
                dispatch(deleteRecipe(deleteItemId))
            }
        }
        setSelectedItemId(null);
    }

    const addItem = (addedItem : Item) => {
        if(isFoodItem(addedItem)){
            dispatch(addFood(addedItem))
        } else if(isRecipeItem(addedItem)){
            dispatch(addRecipe(addedItem))
        }
    }

    // handles the change of search input and updates currently displayed items 
    const handleOnchange = (e : any) => {
        const newValue = e.target.value;
        setSearchedItem(newValue);
    }

    // testing function for search of items
    const handleSearch = () => {
        setSearchedItem("")
    }

    if(loading) return <>Loading data...</>
    if(!foods || !recipes) return (<div>No data from database, check your connection.</div>)

  return (
    <>
    <div id='search-bar'>
        <span>The Food Guide</span>
        <input id='search-field' value={searchedItem} onChange={handleOnchange}/>
        <button id='search-button' onClick={handleSearch}>Search</button>
        {/* add new item to list */}
        <button id='add-item' onClick={() => {setAddItemClicked((prev) => !prev)}}>Add food item +</button>
        {/* add new recipe item to the list */}
        <button id='add-recipe' onClick={() => {setAddRecipeClicked((prev) => !prev)}}>Add recipe +</button>
        {/* select an diet option */}
        <h3>Select your food preference:</h3>
        <select value={dietPlan} onChange={(e : any) => setDietPlan(e.target.value)} id='diets'>
            <option value="">--Please choose an option--</option>
            <option value="all">All food</option>
            <option value="carnivorous">carnivorous</option>
            <option value="vegetarian">vegetarian</option>
            <option value="fruitarian">fruitarian</option>
        </select>
        {/* Add recipe  */}
        {addRecipeClicked && <AddRecipeItem onAdd={addItem} onClose={() => setAddRecipeClicked(false)}/>}
        {/* Add food  */}
        {addItemClicked  && <AddFoodItem onAdd={addItem} onClose={() => setAddItemClicked(false)}/>}
    </div>
    <ControlPanel nodeServerRunning={message}/>
    <div id='display'>
        {selectedItemId === null  ? 

        <ItemsDisplay 
        dietPlanType={dietPlan} 
        search={searchedItem} 
        items={itemsList} 
        onSelectItem={setSelectedItemId} /> : 

        <ReadItem 
        onSelectItem={setSelectedItemId} 
        itemId={selectedItemId} 
        onUpdate={updateItem} 
        onClose={() => setSelectedItemId(null)} 
        onDelete={deleteItem} 
        items={itemsList} />}
    </div>
    </>
  )
}

export default HomePage;