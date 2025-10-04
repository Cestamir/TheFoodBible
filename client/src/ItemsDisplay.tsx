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

    const filteredItems = items.filter((item) => item.title.includes(search))

  return (
    <div>
        <div id='search-item-grid'>
        {search === "" ? items.map(item => (
            <div key={item._id} onClick={() => onSelectItem(item._id)}>
                <ItemDisplay itemToDisplay={item}/>
            </div>
        )) : filteredItems.map(item => (
            <div key={item._id} onClick={() => onSelectItem(item._id)}>
                <ItemDisplay itemToDisplay={item}/>
            </div>
        ))}
        </div>
    </div>
  )
}

export default ItemsDisplay