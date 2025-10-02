import type {Item} from './ReadItem'
// need to fix the type here

const ItemDisplay = ({itemToDisplay}: any) => {

  return (
    <div className='search-item'>
        <div>{itemToDisplay.title}</div>
    </div>
  )
}

export default ItemDisplay