import type {Item} from '../utils/types'
import { isRecipeItem,isFoodItem } from '../utils/types';

export interface itemDisplayProps{
  itemToDisplay: Item;
  onToggle: (id: string) => void;
}

const ItemDisplay = ({itemToDisplay,onToggle}: itemDisplayProps) => {

  return (
    <div className='search-item' onClick={() => onToggle(itemToDisplay._id)}>
        <div>{isFoodItem(itemToDisplay) ? itemToDisplay.name : itemToDisplay.title}</div>
        {isFoodItem(itemToDisplay) && itemToDisplay.imageUrl != null ? <div>
          <img width={32} height={32} src={itemToDisplay.imageUrl}/>
          </div> : <div>🥗</div>}
    </div>
  )
}

export default ItemDisplay