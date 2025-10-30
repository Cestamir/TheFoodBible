import {useState}  from 'react'
import ReadItem from '../components/ReadItem';
import AddRecipeItem from '../components/AddRecipeItem';
import AddFoodItem from '../components/AddFoodItem';
import ItemsDisplay from '../components/ItemsDisplay';
import { isFoodItem, isRecipeItem, type Item } from '../utils/types';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../reduxstore/store';
import { addFood, addRecipe, deleteFood, deleteRecipe, updateFood, updateRecipe } from '../reduxstore/itemsSlice';

// diet options
type DietType = "" | "all" | "carnivorous" | "vegetarian" | "fruitarian";

const HomePage = () => {
    // Redux 
    const dispatch = useDispatch();
    const {foods,recipes,loading} = useSelector((state: RootState) => state.items);

    // basic settings
    const [dietPlan,setDietPlan] = useState<DietType>("all");
    const itemsList = [...foods,...recipes];

    // input entered in search field
    const [searchedItem,setSearchedItem] = useState<string>("");

    // add button events
    const [addItemClicked,setAddItemClicked] = useState<boolean>(false);
    const [addRecipeClicked,setAddRecipeClicked] = useState<boolean>(false);

    // functions to update the data on page, via props
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
    <div className='pagewraper foodguide'>
    <div id='search-bar'>
        <div id='actions'>
            {/* add new item to list */}
            <button id='add-item' onClick={() => {setAddItemClicked((prev) => !prev)}}>Add new food +</button>

            {/* add new recipe item to the list */}
            <button id='add-recipe' onClick={() => {setAddRecipeClicked((prev) => !prev)}}>Add new recipe +</button>
        </div>

        {/* search field */}
        <div id='search'>
            <label htmlFor='search-field'>Search for an item..</label>
            <input placeholder='Orange' id='search-field' value={searchedItem} onChange={handleOnchange}/>
            <button id='search-button' onClick={handleSearch}>Search</button>
        </div>

        {/* diet options */}
        <div id='preference'>
            <h3>Select your preference:</h3>
            <select value={dietPlan} onChange={(e : any) => setDietPlan(e.target.value)} id='diets'>
                <option value="">--Please choose an option--</option>
                <option value="all">All food diets</option>
                <option value="carnivorous">carnivorous</option>
                <option value="vegetarian">vegetarian</option>
                <option value="fruitarian">fruitarian</option>
            </select>
        </div>
    </div>

        {/* Add new recipe/food components */}
        {addRecipeClicked && <AddRecipeItem onAdd={addItem} onClose={() => setAddRecipeClicked(false)}/>}
        {addItemClicked  && <AddFoodItem onAdd={addItem} onClose={() => setAddItemClicked(false)}/>}

            {/* grid display of all items, detail of a selected item */}
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
    </div>
  )
}

export default HomePage;