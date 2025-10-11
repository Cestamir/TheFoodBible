import type {Item} from '../utils/types'
import { isRecipeItem } from '../utils/types';

interface itemDisplayProps{
  itemToDisplay: Item;
  onToggle: (id: string) => void;
}

const ItemDisplay = ({itemToDisplay,onToggle}: itemDisplayProps) => {

  return (
    <div className='search-item' onClick={() => onToggle(itemToDisplay._id)}>
        <div>{itemToDisplay.title}</div>
        {isRecipeItem(itemToDisplay) ? itemToDisplay.image ? <div>✅</div> : <div>❌</div> : null}
    </div>
  )
}

export default ItemDisplay