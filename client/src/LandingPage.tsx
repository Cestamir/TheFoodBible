import { useEffect, useState } from 'react'
import ReadItem from './ReadItem';
import FormEl from './AddRecipeItem';
import AddFoodItem from './AddFoodItem';
import ItemsDisplay from './ItemsDisplay';
import ItemDisplay from './ItemDisplay';

export interface recipeFace {
    type: "recipe",
    _id: string,
    title: string,
    instructions: string,
    ingredients: string[],
    author: string
    cookTime: string
    url: string
    image: string
    createdAt: Date
}

export interface foodFace {
    type: "food",
    _id: string,
    title: string,
    url: string,
    foodType: string,
    author: string
    createdAt: Date
}

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

    // server testing

    const [message,setMessage] = useState<string>("");

    useEffect(() => {
        fetch("/api/test")
        .then(res => res.json())
        .then(data => setMessage(data.message))
        .catch((err) => {
            console.error("error fetching data:",err)
        })
    },[]);

    // limited data

    const [limitedData,setLimitedData] = useState<number>(50);


    // basic values

    const [searchedItem,setSearchedItem] = useState<string>("");
    const [displayItems,setDisplayItems] = useState<items[]>([]);
    const [itemClicked,setItemClicked] = useState<boolean>(false);
    const [currentItem,setCurrentItem] = useState<items>();

    // default item list
    const [itemsList,setItemsList] = useState<items[]>([...foods,...recipes]);

    // storing the value of new item and display of the inputs to add it
    const [addItemClicked,setAddItemClicked] = useState<boolean>(false);
    const [addRecipeClicked,setAddRecipeClicked] = useState<boolean>(false);

    // functions to update the data on page

    const [selectedItemId,setSelectedItemId] = useState<string | null>(null);

    const updateItem = (updatedItem : any) => {
        setItemsList((prevItems) => prevItems.map((item) => item._id === updatedItem._id ? updatedItem : item));
    }

    const deleteItem = (deleteItemId : string) => {
        setItemsList((prevItems) => prevItems.filter((item) => item._id !== deleteItemId))
        setSelectedItemId(null);
    }

    const addItem = (addedItem : any) => {
        setItemsList((prevItems) => [...prevItems,addedItem]);
    }



    // handles the change of search input and updates currently displayed items 
    const handleOnchange = (e : any) => {
        // resets load more btn
        setLimitedData(50);

        const newValue = e.target.value;
        setSearchedItem(newValue);

        if(newValue){
            showItems(newValue);
        }
    }

    // testing function for search of items
    const handleSearch = () => {
        setSearchedItem("")
        showItems(searchedItem)
    }

    // Checks for every item in #database of foods, that contains string given as param in food name
    const showItems = (inputValue : string) => {
        let filteredItems : items[] = itemsList.filter((item) => {
            if (item.title.toLowerCase().includes(inputValue)){
                return item;
            }
        })
        setDisplayItems(filteredItems)
    }

    // filters a item from #database of foods, that matches id with the id given as param
    const showDetail = (id : string) => {
        itemsList.filter((item) => {
            if(id == item._id){
                setCurrentItem(item)
                return item;
            }
        })
    }

    // load more items

    const loadMoreItems = () => {
        setLimitedData(prev => prev + 25);
    }

  return (
    <>
    <div>{message}</div>
    <div id='search-bar'>
        <span>The Food Guide</span>
        <input id='search-field' value={searchedItem} onChange={handleOnchange}/>
        <button id='search-button' onClick={handleSearch}>Search</button>

        {/* add new item to list */}
        {!addItemClicked && !addRecipeClicked ? <button id='add-item' onClick={() => {setAddItemClicked((prev) => !prev)}}>Add food item +</button> : null}

        {/* add new recipe item to the list */}
        {!addItemClicked  && !addRecipeClicked ? <button id='add-recipe' onClick={() => {setAddRecipeClicked((prev) => !prev)}}>Add recipe +</button> : null}
        {/* Add recipe  */}
        {addRecipeClicked && <div>
            <FormEl/>
            </div>}
        {/* Add food  */}
        {addItemClicked  && <div>
            <AddFoodItem/>
            </div>}
    </div>
    <div id='display'>
        {selectedItemId === null  ? <ItemsDisplay search={searchedItem} items={itemsList} onSelectItem={setSelectedItemId} /> : <ReadItem itemId={selectedItemId} onUpdate={updateItem} onClose={() => setSelectedItemId(null)} onDelete={deleteItem} items={itemsList} />}
    </div>
    </>
  )
}

export default LandingPage