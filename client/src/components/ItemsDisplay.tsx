import { useState } from 'react';
import ItemDisplay from './ItemDisplay';
import { isFoodItem, isRecipeItem, type Item } from '../utils/types';

interface itemsListProps{
    items: Item[];
    onSelectItem: (id : string) => void;
    search: string;
}

const ItemsDisplay = ({items, onSelectItem,search} : itemsListProps ) => {

// need to add limit to reduce load time of the items
    let filteredItems;
    if(search.trim() === "food"){
        filteredItems = items.filter((item) => item.type === "food")
    } else if(search.trim() === "recipe"){
        filteredItems = items.filter((item) => item.type === "recipe")

    } else {
        filteredItems = items.filter((item) => {
            if(isFoodItem(item)){
               return item.name.toLowerCase().includes(search.toLowerCase());
            } else if(isRecipeItem(item)){
               return item.title.toLowerCase().includes(search.toLowerCase());
            }
        })
    }

    
    const testData = () => {
        const token = localStorage.getItem("token")
        console.log(token)
    }

    if(filteredItems.length < 1) return <>No matching items.</>



  return (
    <div>
        <div id='search-item-grid'>
            <button onClick={testData}>TEST DATA</button>
        {search === "" ? items.map(item => (
                <ItemDisplay key={item._id} onToggle={() => onSelectItem(item._id)} itemToDisplay={item}/>
        )) : filteredItems.map(item => (
                <ItemDisplay key={item._id} onToggle={() => onSelectItem(item._id)} itemToDisplay={item}/>
        ))}
        </div>
    </div>
  )
}

export default ItemsDisplay