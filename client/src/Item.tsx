import React from 'react'

import type { foodFace } from './LandingPage'
import type { recipeFace } from './LandingPage'

const Item = ({itemToDisplay}: any) => {

  return (
    <div className='search-item'>
        <div>{itemToDisplay.title}</div>
    </div>
  )
}

export default Item