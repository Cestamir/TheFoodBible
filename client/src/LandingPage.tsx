import React, { useEffect, useState } from 'react'
import { foodList } from '.';


interface Food{
    id: number
    name: string
    class: string
}

const LandingPage = () => {

    // server testing

    const [message,setMessage] = useState<string>("");

    useEffect(() => {
        fetch("api/test")
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
    const [displayItems,setDisplayItems] = useState<Food[]>([]);
    const [itemClicked,setItemClicked] = useState<boolean>(false);
    const [currentItem,setCurrentItem] = useState<Food>();

    // edit items
    const [editBtnClicked,setEditBtnClicked] = useState<boolean>(false);
    const [editItem,setEditItem] = useState<Food>({id: 0,name: "",class: ""});

    // default item list
    const [itemsList,setItemsList] = useState(foodList)

    const [defaultDetailStyle,setDefaultDetailStyle] = useState({display:"grid"})

    // storing the value of new item and disply of the inputs to add it
    const [addItemClicked,setAddItemClicked] = useState<boolean>(false);

    const [newItem,setNewItem] = useState<Food>({id: 0,name: "",class: ""});

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
    const showItems = (input : string) => {
        let filteredItems = itemsList.filter((item) => {
            if (item.name.includes(input)){
                return item;
            }
        })
        setDisplayItems(filteredItems)
    }

    // filters a item from #database of foods, that matches id with the id given as param
    const showDetail = (id : number) => {
        itemsList.filter((item) => {
            if(id == item.id){
                setCurrentItem(item)
                return item;
            }
        })
    }

    // handles addition of a new item and updates current dataset of items

    const handleSubmit = (e : React.FormEvent) => {
        if(newItem.name.length < 1 || newItem.class.length < 1){
            return;
        }
        try{
        e.preventDefault();
        let addedItem;
        const maxId = Math.max(...itemsList.map((item) => item.id)) + 1
        addedItem = {id: maxId,name: newItem.name,class: newItem.class}
        
        const updatedArr = [...itemsList,addedItem];

        setItemsList(updatedArr)

        setNewItem({id: 0,name: "",class: ""});
        } catch(e){
            console.log(e)
        } finally {
            setAddItemClicked(prev => !prev)
            setCurrentItem(undefined);
            // where does it switch to none ? need to find better solution than setting state directly
            setDefaultDetailStyle({display: "grid"})
        }
    }

    // handles the submition of edit form and updates current dataset of items

    const handleEdit = (e : React.FormEvent) => {
        try{
        e.preventDefault();
        
        const updatedArr = itemsList.map((item) => {
            if(item.id === editItem.id){
                item.name = editItem.name;
                item.class = editItem.class;
            }
            return item;
        });

        setItemsList(updatedArr)

        setEditItem({id: 0,name: "",class: ""});
        }catch(e){
            console.log(e)
        }finally{
        setEditBtnClicked(prev => !prev);
        setCurrentItem(undefined);
        // where does it switch to none ? need to find better solution than setting state directly
        setDefaultDetailStyle({display: "grid"})
        setItemClicked(prev => !prev)
        }
    }

    // change og the values in edit form
    const editItemChange = (e: any) => {
        const changeTarget = e.target.id;
        const value = e.target.value;
        if(changeTarget === "edit-item-name"){
            setEditItem((prev) => ({
                ...prev,name: value
            }))
        } else if(changeTarget === "edit-item-class"){
            setEditItem((prev) => ({
                ...prev,class: value
            }))
        }
    }

    // handles a change in inputs of adding a new food item

    const newItemChange = (e : any) => {
        const changeTarget = e.target.id;
        const value = e.target.value;
        if(changeTarget === "new-item-name"){
            setNewItem((prev) => ({
                ...prev,name: value
            }))
        } else if(changeTarget === "new-item-class"){
            setNewItem((prev) => ({
                ...prev,class: value
            }))
        }
    }

    // handle deletetion of an item, modifies the original dataset of foods

    const handleDelete = () => {
        let deletionItem = currentItem;
        let isConfirmed = confirm(`Are you sure you want to delete item ${deletionItem?.name} ?`);
        if(isConfirmed){
            console.log("deleted")
            const itemIndex = itemsList.findIndex((item) => item.id === deletionItem?.id);
            itemsList.splice(itemIndex,1);
        };
        setItemClicked(prev => !prev)
        setDefaultDetailStyle({display: "grid"})
    }


    // testing button

    const makeTest = () => {
        console.log(message)
    }

    // load more items

    const loadMoreItems = () => {
        setLimitedData(prev => prev + 25);
    }

  return (
    <>
    <div id='search-bar'>
        <button id='test-btn' onClick={makeTest}>TEST</button>
        <span>The Food Bible</span>
        <div>{message}</div>
        <input id='search-field' value={searchedItem} onChange={handleOnchange}/>
        <button id='search-button' onClick={handleSearch}>Search</button>
        {/* add new item to list */}
        {!addItemClicked && !editBtnClicked ? <button id='add-item' onClick={() => {setAddItemClicked((prev) => !prev)}}>Add item +</button> : null}
        {/* Add form */}
        {addItemClicked && !editBtnClicked && <div>
                <form onSubmit={handleSubmit}>
                    <label>New item name:</label>
                    <input value={newItem?.name} onChange={newItemChange} id='new-item-name'/>
                    <label>New item class:</label>
                    <input value={newItem?.class} onChange={newItemChange} id='new-item-class'/>
                    <button type='submit' >Confirm item ✅</button>
                    <button onClick={() => !addItemClicked}>X cancel</button>
                </form>
            </div>}
            {/* Edit form */}
        {editBtnClicked && !addItemClicked && <div>
                <form onSubmit={handleEdit}>
                    <label>Edit name {currentItem?.name} :</label>
                    <input value={editItem?.name} onChange={editItemChange} id='edit-item-name'/>
                    <label>Edit class {currentItem?.class} :</label>
                    <input value={editItem?.class} onChange={editItemChange} id='edit-item-class'/>
                    <button type='submit' >Confirm Edit ☑️</button>
                    <button onClick={() => {
                        setEditBtnClicked(prev => !prev);
                        !editBtnClicked}}>X cancel</button>
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
                        showDetail(item.id);
                        setDefaultDetailStyle({display: "none"})
                        }}  
                    key={item.id}
                    className='search-item'
                    id={`search-item-${item.id}`}>
                        {item.name}
                    </div>
                </>
                )) : limitedData < 51 ? itemsList.filter((item,index) => index <25).map((item) => (
                <>
                
                    <div onClick={() => {
                        setItemClicked(prev => !prev)
                        showDetail(item.id);
                        setDefaultDetailStyle({display: "none"})
                        }}  
                    key={item.id}
                    className='search-item'
                    id={`search-item-${item.id}`}>
                        {item.name}
                    </div>
                </>
                // display more data if btn load more was clicked
                )) : itemsList.filter((item,index) => index < limitedData).map((item) => (
                    <div onClick={() => {
                        setItemClicked(prev => !prev)
                        showDetail(item.id);
                        setDefaultDetailStyle({display: "none"})
                        }}  
                    key={item.id}
                    className='search-item'
                    id={`search-item-${item.id}`}>
                        {item.name}
                    </div>
                ))}
                {/* loads more data */}
                {searchedItem && displayItems.length < 25 ? null :<button onClick={loadMoreItems} id='load-more-btn'>LOAD MORE...</button>}
            </div>
            {/* item detail */}
            <div id='search-item-detail'>
                {itemClicked && currentItem && <p>
                        <span>{currentItem?.class}</span>
                        <span>{currentItem?.id}</span>
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
                            setEditBtnClicked(prev => !prev);
                            setEditItem({id:currentItem?.id,name:currentItem?.name,class:currentItem?.class})
                            
                        }}>🔄 CHANGE</button>
                        {/* delete btn */}
                        <button 
                        id='delete-btn'
                        onClick={() =>{handleDelete()}}>
                            🔴DELETE
                        </button>
                        </p>}
            </div>
        
    </div>
    </>
  )
}

export default LandingPage