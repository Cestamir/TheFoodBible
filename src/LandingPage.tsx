import React, { useState } from 'react'
import { foodList } from '.';

interface Food{
    name: string
    class: string
}

const LandingPage = () => {

    const [searchedItem,setSearchedItem] = useState<string>("");
    const [displayItems,setDisplayItems] = useState<Food[]>([]);

    const handleOnchange = (e : any) => {
        setSearchedItem(e.target.value);
    }

    const handleSearch = () => {
        setSearchedItem("")
        showItems(searchedItem)
    }

    const showItems = (input : string) => {
        let filteredItems = foodList.filter((item) => {
            if (item.name.includes(input)){
                return item;
            }
        })
        setDisplayItems(filteredItems)
    }

  return (
    <div id='search-bar'>
        <span>The Food Bible</span>
        <input id='search-field' value={searchedItem} onChange={handleOnchange}/>
        <button id='search-button' onClick={handleSearch}>Search</button>
        <div id='display'>
            {displayItems.map((item) => (<p key={item.name}>{item.name}</p>))}
        </div>
    </div>
  )
}

export default LandingPage