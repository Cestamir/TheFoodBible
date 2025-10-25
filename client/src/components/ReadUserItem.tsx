import React from 'react'
import type { Item } from '../utils/types'
import { isRecipeItem,isFoodItem } from '../utils/types'

interface ReadUserItemProps{
    foodItem: Item,
    onClose: ()=> void;
}

const ReadUserItem = ({foodItem,onClose}: ReadUserItemProps) => {

    const item = foodItem

  return (
    <>
    {isRecipeItem(item) ? 
    <div>
        <button onClick={() => onClose()}>❌</button>
        <h2>{item.name}</h2>
        <h3>{item.diet}</h3>
        {item.imageUrl != null ? <div>
        <img width={32} height={32} src={item.imageUrl}/>
        </div> : <div>🥗</div>}

        {item.url ? <h4>url :{<a target="_blank" rel="noreferrer noopener" href={item.url}>{item.url}</a>}</h4> : <h4>No url.</h4>}
        <div style={{width: "200px",height: "200px",overflowY: "scroll"}}>
            {item.ingredients?.length ? item.ingredients.map((ing,i) => (
                <span key={i} style={{display: "block"}}>{ing}</span>
            )) : <p>No ingredients available.</p>}
        </div>
    </div> : <div>
        <button onClick={() => onClose()}>❌</button>
        <h2>{item.name}</h2>
        <h3>{item.foodType}</h3>
        {item.fdcId ? <h4>{item.fdcId}</h4> : <h4>No fdcId.</h4>}
        {item.imageUrl != null ? <div>
        <img width={32} height={32} src={item.imageUrl}/>
        </div> : <div>🥗</div>}

        {item.wikiUrl ? <h4>Wiki url :{<a target="_blank" rel="noreferrer noopener" href={item.wikiUrl}>{item.wikiUrl}</a>}</h4> : <h4>No Wiki url.</h4>}
        <div style={{width: "200px",height: "200px",overflowY: "scroll"}}>
            {item.nutrition?.length ? item.nutrition.map((nutrient) => (
                <span key={nutrient.name} style={{display: "block"}}>{nutrient.name} {nutrient.value}{nutrient.unit}</span>
            )) : <p>No nutrients available.</p>}
        </div>
    </div> }
    </>
  )
}

export default ReadUserItem