import { useState } from 'react';
import ItemDisplay from './ItemDisplay';
import { isFoodItem, isRecipeItem, type Item } from '../utils/types';

interface itemsListProps{
    items: Item[];
    onSelectItem: (id : string) => void;
    search: string;
}

const ItemsDisplay = ({items, onSelectItem,search} : itemsListProps ) => {

    const [visibleCount,setVisibleCount] = useState(50);

    let filteredItems;
    let searchedInput = search.trim();

    switch(searchedInput){
        case "food":
            filteredItems = items.filter((item) => item.type === "food");
            break;
        case "recipe":
            filteredItems = items.filter((item) => item.type === "recipe");
            break;
        case "fruit":
            filteredItems = items.filter(item => isFoodItem(item) && item.foodType.toLowerCase() === "fruit");
            break;
        case "vegetable":
            filteredItems = items.filter(item => isFoodItem(item) && item.foodType.toLowerCase() === "vegetable");
            break;
        case "meat":
            filteredItems = items.filter(item => isFoodItem(item) && item.foodType.toLowerCase() === "meat");
            break;
        case "seed":
            filteredItems = items.filter(item => isFoodItem(item) && item.foodType.toLowerCase() === "seed");
            break;
        case "herbs and spices":
            filteredItems = items.filter(item => isFoodItem(item) && item.foodType.toLowerCase() === "herbs and spices");
            break;
        case "vegetarian":
            filteredItems = items.filter(item => isFoodItem(item) && (item.foodType.toLowerCase() === "vegetable" || item.foodType === "seed" || item.foodType === "fruit" || item.foodType === "herbs and spices"));
            break;
        case "carnivorous":
            filteredItems = items.filter(item => isFoodItem(item) && (item.foodType.toLowerCase() === "meat" || item.foodType.toLowerCase() === "beef" || item.foodType.toLowerCase() === "pork" || item.foodType.toLowerCase() === "lamb and mutton"));
            break;
        default:
            filteredItems = items.filter((item) => {
            if(isFoodItem(item)){
               return item.name.toLowerCase().includes(search.toLowerCase());
            } else if(isRecipeItem(item)){
               return item.title.toLowerCase().includes(search.toLowerCase());
            }
            })
            break;
    }

    const loadMore = () => {
        setVisibleCount(prev => prev + 50);
    }

    const itemsToDisplay = search === "" ? items : filteredItems;
    const limitedItems = itemsToDisplay.slice(0,visibleCount);
    const hasMoreItems = visibleCount < itemsToDisplay.length;

    if(items.length < 1) return <>Loading..</>
    if(filteredItems.length < 1) return <>No matching items.</>



  return (
    <div>
        <div id='search-item-grid'>
            {limitedItems.map((item) => (
                <ItemDisplay key={item._id} onToggle={() => onSelectItem(item._id)} itemToDisplay={item}/>
            ))}
        </div>
        {hasMoreItems && (
            <button onClick={() => loadMore()} style={{margin: "20px auto",display: "block"}}>
                Load more ({itemsToDisplay.length - visibleCount} remaining) 
            </button>
        )}
    </div>
  )
}

export default ItemsDisplay