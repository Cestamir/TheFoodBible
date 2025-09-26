import React, { useEffect, useState } from 'react'
import { foodList } from '.';


// CHECK ME OUT !!!!!
// 
// currently working to add a new food, deletion of food or RecipePage, edit food - need to do the same for the recipes, cleanup the useless code, delete useless interfaces food,edititems

interface Food{
    id: number
    name: string
    class: string
}

interface newFoodFace {
    title: string,
    foodType: string,
    author: string
}

interface newRecipeFace {
    title: string,
    instructions: string,
    ingredients: string[],
    author: string
}

interface recipeFace {
    _id: string,
    title: string,
    instructions: string,
    ingredients: string[],
    author: string
    createdAt: string
}

interface foodFace {
    _id: string,
    title: string,
    foodType: string,
    author: string
}

type items = foodFace | recipeFace;

const LandingPage = () => {

    // get data from the db

    const [recipes,setRecipes] = useState<recipeFace[]>([]);
    const [foods,setFoods] = useState<foodFace[]>([])

     useEffect(() => {
        const loadData = async () => {
            try{
            const res = await fetch(`/api/recipes`);
            const data = await res.json();
            console.log("RECIPES",data)
            setRecipes(data);
            } catch (err) {
                console.log(err)
            }
        }
        loadData();
        },[])
    
    useEffect(() => {
        const loadData = async () => {
            try{
                const res = await fetch("/api/foods");
                const data = await res.json();
                console.log("FOODS ",data)
                setFoods(data)
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

    // edit items
    const [editBtnClicked,setEditBtnClicked] = useState<boolean>(false);
    const [editFoodItem,setEditFoodItem] = useState<newFoodFace>();
    const [editRecipe,setEditRecipe] = useState<newRecipeFace>();
    const [editRecipeClicked,setEditRecipeClicked] = useState<boolean>();

    // default item list
    const [itemsList,setItemsList] = useState<items[]>([...foods,...recipes]);

    const [defaultDetailStyle,setDefaultDetailStyle] = useState({display:"grid"})

    // storing the value of new item and display of the inputs to add it
    const [addItemClicked,setAddItemClicked] = useState<boolean>(false);
    const [addRecipeClicked,setAddRecipeClicked] = useState<boolean>(false);

    const [newFood,setNewFood] = useState<newFoodFace>({title: '',foodType: '',author: ''});
    const [newRecipe,setNewRecipe] = useState<newRecipeFace>({title:'',instructions: '',ingredients: [],author: ''})

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

    // handles addition of a new item and updates current dataset of items

    const handleFoodSubmit = async(e : React.FormEvent) => {
        if(newFood?.title.length < 1 || newFood?.foodType.length < 1){
            return;
        }
        try{
        e.preventDefault();
        const res = await fetch("/api/foods",{method: "POST",headers: {"Content-Type" : "application/json"},body: JSON.stringify(newFood)})
        if(res.ok){
            const addedFood = await res.json();
            const updatedArr = [...itemsList,addedFood];
            setItemsList(updatedArr);
            setNewFood({title: '',foodType: '',author: ''})
        } else {
            console.log("failed to add food")
        }
        } catch(err){
            console.log(err)
        } finally {
            setAddItemClicked(prev => !prev)
            setCurrentItem(undefined);
            // where does it switch to none ? need to find better solution than setting state directly
            setDefaultDetailStyle({display: "grid"})
        }
    }

    // handles the submition of edit form and updates current dataset of items

    const handleFoodEdit = async(e : React.FormEvent,id : any) => {
        try{
        e.preventDefault();

        const editedFood = {_id: currentItem?._id,title: editFoodItem?.title,foodType: editFoodItem?.foodType,author: editFoodItem?.author}

        const res = await fetch(`/api/foods/${id}`,{method: "PUT", headers: {"Content-Type" : "application/json"},body: JSON.stringify({title: editedFood.title,foodType: editedFood.foodType, author: editedFood.author})})

        if(res.ok){
            const updatedFood = await res.json();
            setFoods(prev => prev.map((item) => item._id === id ? updatedFood : item))
            console.log("food updated successfully")
        } else {
            console.log("failed to update food")
        }

        }catch(e){
            console.log(e)
        }finally{
        setEditBtnClicked(prev => !prev);
        setEditFoodItem(undefined)
        setCurrentItem(undefined);
        // where does it switch to none ? need to find better solution than setting state directly
        setDefaultDetailStyle({display: "grid"})
        setItemClicked(prev => !prev)
        }
    }

    // handles recipe edit

    const handleRecipeEdit = async (e : React.FormEvent,id: any) => {
        try{
            e.preventDefault();
            const editedRecipe = {_id: currentItem?._id,title: editRecipe?.title,instructions: editRecipe?.instructions,ingredients: editRecipe?.ingredients,author: editRecipe?.author}
            const res = await fetch(`/api/recipes/${id}`,{method: "PUT",headers: {"Content-Type" : "application/json"},body: JSON.stringify({title: editedRecipe.title,instructions: editedRecipe.instructions,ingredients: editedRecipe.ingredients, author: editedRecipe.author})})
            if(res.ok){
                const updatedRecipe = await res.json();
                setRecipes((prev) => prev.map((item) => item._id === id ? updatedRecipe : item))
                console.log("Recipe updated successfully")
            } else {
                console.log("failed to update recipe",res)
            }
        } catch(err){
            console.log(err)
        } finally {
        setEditRecipeClicked(prev => !prev);
        setEditRecipe(undefined)
        setCurrentItem(undefined);
        // where does it switch to none ? need to find better solution than setting state directly
        setDefaultDetailStyle({display: "grid"})
        setItemClicked(prev => !prev)
        }
    }

    // change og the values in edit form
    const editFoodItemChange = (e: any) => {
        const changeTarget = e.target.id;
        const value = e.target.value;
        if(changeTarget === "edit-food-title"){
            setEditFoodItem((prev) => ({
                ...prev,title: value
            }))
        } else if(changeTarget === "edit-food-type"){
            setEditFoodItem((prev) => ({
                ...prev,foodType: value
            }))
        }
    }

    // handles onchange in edit form recipe

    const editRecipeItemChange = (e : any) => {
        const changeTarget = e.target.id;
        const value = e.target.value
        if(changeTarget === "edit-recipe-title"){
            setEditRecipe((prev) => ({
                ...prev, title: value
            }))
        } else if (changeTarget === "edit-recipe-instructions"){
            setEditRecipe((prev) => ({
                ...prev, instructions: value
            }))
        } else if (changeTarget === "edit-recipe-ingredients"){
            setEditRecipe((prev) => ({
                ...prev,ingredients: value.split(", ")
            }))
        }

    }

    // handles a onchange in inputs of adding a new food item

    const newFoodChange = (e : any) => {
        const changeTarget = e.target.id;
        const value = e.target.value;
        if(changeTarget === "new-food-title"){
            setNewFood((prev) => ({
                ...prev,title: value
            }))
        } else if(changeTarget === "new-food-type"){
            setNewFood((prev) => ({
                ...prev,foodType: value
            }))
        }
    }
    // handles a onchange in inputs od adding a new recipe

    const newRecipeChange = (e : any) => {
        const changeTarget = e.target.id;
        const value = e.target.value;
        if(changeTarget === "new-recipe-title"){
            setNewRecipe((prev) => ({
                ...prev,title: value
            }))
        } else if(changeTarget === "new-recipe-instructions"){
            setNewRecipe((prev) => ({
                ...prev,instructions: value
            }))
        } else if(changeTarget === "new-recipe-ingredients"){
            setNewRecipe((prev) => ({
                ...prev,ingredients: value.split(", ")
            }))
        } else if (changeTarget === "new-recipe-author"){
            setNewRecipe((prev) => ({
                ...prev,author: value
            }))
        }
    }
    // add recipe

    const handleRecipeSubmit = async(e : React.FormEvent) => {
        if(newRecipe?.title.length < 1 || newRecipe?.instructions.length < 1){
            return;
        }
        try{
        e.preventDefault();
        const res = await fetch("/api/recipes",{method: "POST",headers: {"Content-Type" : "application/json"},body: JSON.stringify(newRecipe)})
        if(res.ok){
            const addedRecipe = await res.json();
            const updatedArr = [...itemsList,addedRecipe];
            setItemsList(updatedArr);
            setNewRecipe({title: '',instructions: '',ingredients: [],author: ''})
        } else {
            console.log("failed to add recipe")
        }
        } catch(err){
            console.log(err)
        } finally {
            setAddRecipeClicked(prev => !prev)
            setCurrentItem(undefined);
            // where does it switch to none ? need to find better solution than setting state directly
            setDefaultDetailStyle({display: "grid"})
        }
    }

    // handle deletetion of a selected item

    const handleDelete = async (id : string) => {
        let isConfirmed = confirm(`Are you sure you want to delete ${currentItem?.title} ?`);
        if(currentItem?.instructions && isConfirmed){
            const res = await fetch(`/api/recipes/${id}`,{method: "DELETE"})
            if(res.ok){
                setRecipes(prev => prev.filter((item) => item._id !== id))
            }
        } else if (!currentItem?.instructions && isConfirmed){
            const res = await fetch(`/api/foods/${id}`,{method: "DELETE"})
            if(res.ok){
                setFoods(prev => prev.filter((item) => item._id !== id))
            }
        }
        setItemClicked(prev => !prev)
        setDefaultDetailStyle({display: "grid"})
    }

    // load more items

    const loadMoreItems = () => {
        setLimitedData(prev => prev + 25);
    }

  return (
    <>
    <div id='search-bar'>
        <span>The Food Bible</span>
        <div>{message}</div>
        <input id='search-field' value={searchedItem} onChange={handleOnchange}/>
        <button id='search-button' onClick={handleSearch}>Search</button>
        {/* add new item to list */}
        {!addItemClicked && !editBtnClicked && !addRecipeClicked ? <button id='add-item' onClick={() => {setAddItemClicked((prev) => !prev)}}>Add food item +</button> : null}

        {/* add new recipe item to the list */}
        {!addItemClicked && !editBtnClicked && !addRecipeClicked ? <button id='add-recipe' onClick={() => {setAddRecipeClicked((prev) => !prev)}}>Add recipe +</button> : null}
        {addRecipeClicked && !addItemClicked && <div>
                <form onSubmit={handleRecipeSubmit}>
                    <label>New recipe name:</label>
                    <input value={newRecipe?.title} onChange={newRecipeChange} id='new-recipe-title'/>
                    <label>New recipe instructions:</label>
                    <input value={newRecipe?.instructions} onChange={newRecipeChange} id='new-recipe-instructions'/>
                    <label>New recipe ingredients:</label>
                    <input value={newRecipe?.ingredients} onChange={newRecipeChange} id='new-recipe-ingredients'/>

                    {/* overflowing cant type name properly fix CSS*/}

                    <label>New recipe author:</label>
                    <input value={newRecipe?.author} onChange={newRecipeChange} id='new-recipe-author'/>
                    <button type='submit' >Add Recipe ✅</button>
                    <button onClick={() => !addRecipeClicked}>X cancel</button>
                </form>
            </div>}
        {/* Add food item form */}
        {addItemClicked && !editBtnClicked && <div>
                <form onSubmit={handleFoodSubmit}>
                    <label>New food name:</label>
                    <input value={newFood?.title} onChange={newFoodChange} id='new-food-title'/>
                    <label>New food type:</label>
                    <input value={newFood?.foodType} onChange={newFoodChange} id='new-food-type'/>
                    <button type='submit' >Add Food ✅</button>
                    <button onClick={() => !addItemClicked}>X cancel</button>
                </form>
            </div>}
            {/* Edit form for food*/}
        {editBtnClicked && !addItemClicked && <div>
                <form onSubmit={(e) => handleFoodEdit(e,currentItem?._id)}>
                    <label>Edit food title {currentItem?.title} :</label>
                    <input value={editFoodItem?.title} onChange={editFoodItemChange} id='edit-food-title'/>
                    <label>Edit food type {currentItem?.foodType} :</label>
                    <input value={editFoodItem?.foodType} onChange={editFoodItemChange} id='edit-food-type'/>
                    <button type='submit' >Confirm Edit ☑️</button>
                    <button onClick={() => {
                        setEditBtnClicked(prev => !prev);
                        !editBtnClicked}}>X cancel</button>
                </form>
            </div>}
            {/* edit recipe form */}
            {editRecipeClicked && !addItemClicked && <div>
                <form onSubmit={(e) => handleRecipeEdit(e,currentItem?._id)}>
                    <label>Edit recipe title {currentItem?.title} :</label>
                    <input value={editRecipe?.title} onChange={editRecipeItemChange} id='edit-recipe-title'/>
                    <label>Edit recipe instructions :</label>
                    <input value={editRecipe?.instructions} onChange={editRecipeItemChange} id='edit-recipe-instructions'/>
                    <label>Edit recipe ingredients :</label>
                    <input value={editRecipe?.ingredients} onChange={editRecipeItemChange} id='edit-recipe-ingredients'/>
                    <button type='submit' >Confirm Edit ☑️</button>
                    <button onClick={() => {
                        setEditRecipeClicked(prev => !prev);
                        !editRecipeClicked}}>X cancel</button>
                </form>
            </div>}
    </div>
    <div id='display'>
        {/* displays items based on the input entered, displays item detail if clicked */}
            <div id='search-item-grid' style={defaultDetailStyle}>
            {searchedItem ? displayItems.map((item) => (
                <>
                
                    <div onClick={() => {
                        setItemClicked(prev => !prev)
                        showDetail(item._id);
                        setDefaultDetailStyle({display: "none"})
                        }}  
                    key={item._id}
                    className='search-item'
                    id={`search-item-${item._id}`}>
                        {item.title}
                    </div>
                </>
                )) : limitedData < 51 ? itemsList.filter((item,index) => index <25).map((item) => (
                <>
                
                    <div onClick={() => {
                        setItemClicked(prev => !prev)
                        showDetail(item._id);
                        setDefaultDetailStyle({display: "none"})
                        }}  
                    key={item._id}
                    className='search-item'
                    id={`search-item-${item._id}`}>
                        {item.title}
                    </div>
                </>
                // display more data if btn load more was clicked
                )) : itemsList.filter((item,index) => index < limitedData).map((item) => (
                    <div onClick={() => {
                        setItemClicked(prev => !prev)
                        showDetail(item._id);
                        setDefaultDetailStyle({display: "none"})
                        }}  
                    key={item._id}
                    className='search-item'
                    id={`search-item-${item._id}`}>
                        {item.title}
                    </div>
                ))}
                {/* loads more data */}
                {searchedItem && displayItems.length < 25 ? null :<button onClick={loadMoreItems} id='load-more-btn'>LOAD MORE...</button>}
            </div>
            {/* item detail */}
            <div id='search-item-detail'>
                {itemClicked && currentItem && <p>
                        <span>{currentItem?.author}</span>
                        <span>{currentItem?._id}</span>
                        {/* cancel btn */}
                        <button 
                        id='back-btn'
                        onClick={() => {
                            setItemClicked(prev => !prev)
                            setDefaultDetailStyle({display: "grid"})
                            setEditBtnClicked(false)
                        }}>❌ BACK</button>
                        {/* edit btn */}
                        <button
                        id='edit-btn'
                         onClick={() => {
                            if("instructions" in currentItem){
                            setEditRecipeClicked(prev => !prev)
                            setEditRecipe({title: currentItem?.title,instructions: currentItem?.instructions,ingredients: currentItem?.ingredients,author: currentItem?.author})
                            } else if ("foodType" in currentItem) {
                            setEditBtnClicked(prev => !prev);
                            setEditFoodItem({title:currentItem?.title,foodType:currentItem?.foodType,author: currentItem?.author})
                            }
                        }}>🔄 CHANGE</button>
                        {/* delete btn */}
                        <button 
                        id='delete-btn'
                        onClick={() =>{handleDelete(currentItem._id)}}>
                            🔴DELETE
                        </button>
                        </p>}
            </div>
        
    </div>
    </>
  )
}

export default LandingPage