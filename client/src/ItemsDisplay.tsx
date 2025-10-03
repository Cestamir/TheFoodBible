import { useState } from 'react';
import ItemDisplay from './ItemDisplay';
import type { Item } from './ReadItem';

interface itemsListProps{
    items: Item[];
    onSelectItem: (id : string) => void;
    search: string;
}

const ItemsDisplay = ({items, onSelectItem,search} : itemsListProps ) => {

// need to add limit to reduce load time of the items
// need to fix the search function

    const [inputEntered,setInputEntered] = useState(search)

    function showInfo(){
        console.log(search)
    }

    // need to fic the search bar function, the search contains the entered input but dont know how to proper display this info and items based on that 

  return (
    <div>
        <div id='search-item-grid'>
        <div onClick={showInfo}>{inputEntered}</div>
        {items.map(item => (
            <div key={item._id} onClick={() => onSelectItem(item._id)}>
                <ItemDisplay itemToDisplay={item}/>
            </div>
        ))}
        </div>
    </div>
  )
}

export default ItemsDisplay