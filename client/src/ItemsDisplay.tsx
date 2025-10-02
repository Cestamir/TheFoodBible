import ItemDisplay from './ItemDisplay';
import type { Item } from './ReadItem';

interface itemsListProps{
    items: Item[];
    onSelectItem: (id : string) => void;
}

const ItemsDisplay = ({items, onSelectItem} : itemsListProps ) => {




  return (
    <div>
        <div id='search-item-grid'>
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