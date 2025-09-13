import React, { useState } from 'react'
import { foodList } from '.';

interface Food{
    id: number
    name: string
    class: string
}

const LandingPage = () => {

    const [searchedItem,setSearchedItem] = useState<string>("");
    const [displayItems,setDisplayItems] = useState<Food[]>([]);
    const [itemClicked,setItemClicked] = useState<boolean>(false);
    const [currentItem,setCurrentItem] = useState<Food>();

    // handles the change of search input and updates currently display itemsth5jgnmb 
    const handleOnchange = (e : any) => {
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
        let filteredItems = foodList.filter((item) => {
            if (item.name.includes(input)){
                return item;
            }
        })
        setDisplayItems(filteredItems)
    }

    // filters a item from #database of foods, that matches id with the id given as param
    const showDetail = (id : number) => {
        foodList.filter((item) => {
            if(id == item.id){
                console.log(item)
                setCurrentItem(item)
                return item;
            }
        })
    }

  return (
    <>
    <div id='search-bar'>
        <span>The Food Bible</span>
        <input id='search-field' value={searchedItem} onChange={handleOnchange}/>
        <button id='search-button' onClick={handleSearch}>Search</button>
    </div>
    <div id='display'>
        {/* displays items based on the input entered, displays item detail if clicked */}
            {searchedItem ? displayItems.map((item) => (
                <div onClick={() => {
                    setItemClicked(prev => !prev)
                    showDetail(item.id);
                    }}  
                className='search-item'
                id={`search-item-${item.id}`} 
                key={item.name}>
                    {item.name}
                    {/* item detail */}
                {itemClicked && currentItem?.id == item.id && <p>
                    <span>{currentItem?.class}</span>
                    <span>{currentItem?.id}</span>
                    </p>}
                
                </div>)) : 
                <p>Nothing to show.</p>}
    </div>
    </>
  )
}

export default LandingPage