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
        {isFoodItem(itemToDisplay) ? <div>
          <img width={32} height={32} src={itemToDisplay.imageUrl}/>
          </div> : null}
        {isRecipeItem(itemToDisplay) ? itemToDisplay.image ? <div>✅</div> : <div>❌</div> : null}
    </div>
  )
}

export default ItemDisplay