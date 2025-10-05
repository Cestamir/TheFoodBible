import { useEffect, useState } from 'react'
import ReadItem from './ReadItem';
import FormEl from './AddRecipeItem';
import AddFoodItem from './AddFoodItem';
import ItemsDisplay from './ItemsDisplay';
import ControlPanel from './ControlPanel';
import type { Item } from './types';
import type { foodFace,recipeFace } from './types';
import LoginPage from './LoginPage';



type items = foodFace | recipeFace;

const LandingPage = () => {

    // get data from the db
    const [recipes,setRecipes] = useState<recipeFace[]>([]);
    const [foods,setFoods] = useState<foodFace[]>([])

     useEffect(() => {
        const loadData = async () => {
            try{
            const recipes = await fetch(`/api/recipes`);
            const recipesData = await recipes.json();
            const foods = await fetch("/api/foods");
            const foodsData = await foods.json();
            console.log("FOODS ",foodsData)
            setFoods(foodsData)
            console.log("RECIPES",recipesData)
            setRecipes(recipesData);
            } catch (err) {
                console.log(err)
            }
        }
        loadData();
        },[])

    useEffect(() => {
        if(foods && recipes){
            const conjoined = [...foods,...recipes]
            setItemsList(conjoined)
        }
    },[foods,recipes])

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

    // input entered
    const [searchedItem,setSearchedItem] = useState<string>("");

    // default item list
    const [itemsList,setItemsList] = useState<items[]>([...foods,...recipes]);

    // storing the value of new item and display of the inputs to add it
    const [addItemClicked,setAddItemClicked] = useState<boolean>(false);
    const [addRecipeClicked,setAddRecipeClicked] = useState<boolean>(false);

    // functions to update the data on page
    const [selectedItemId,setSelectedItemId] = useState<string | null>(null);

    const updateItem = (updatedItem : Item) => {
        setItemsList((prevItems) => prevItems.map((item) => item._id === updatedItem._id ? updatedItem : item));
    }

    const deleteItem = (deleteItemId : string) => {
        setItemsList((prevItems) => prevItems.filter((item) => item._id !== deleteItemId))
        setSelectedItemId(null);
    }

    const addItem = (addedItem : Item) => {
        setItemsList((prevItems) => [...prevItems,addedItem]);
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

  return (
    <>
    <LoginPage/>
    <div id='search-bar'>
        <span>The Food Guide</span>
        <input id='search-field' value={searchedItem} onChange={handleOnchange}/>
        <button id='search-button' onClick={handleSearch}>Search</button>
        {/* add new item to list */}
        <button id='add-item' onClick={() => {setAddItemClicked((prev) => !prev)}}>Add food item +</button>
        {/* add new recipe item to the list */}
        <button id='add-recipe' onClick={() => {setAddRecipeClicked((prev) => !prev)}}>Add recipe +</button>
        {/* Add recipe  */}
        {addRecipeClicked && <FormEl onAdd={addItem} onClose={() => setAddRecipeClicked(false)}/>}
        {/* Add food  */}
        {addItemClicked  && <AddFoodItem onAdd={addItem} onClose={() => setAddItemClicked(false)}/>}
    </div>
    <ControlPanel nodeServerRunning={message}/>
    <div id='display'>
        {selectedItemId === null  ? <ItemsDisplay search={searchedItem} items={itemsList} onSelectItem={setSelectedItemId} /> : <ReadItem itemId={selectedItemId} onUpdate={updateItem} onClose={() => setSelectedItemId(null)} onDelete={deleteItem} items={itemsList} />}
    </div>
    </>
  )
}

export default LandingPage