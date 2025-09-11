import React, { useState } from 'react'


const LandingPage = () => {

    const [searchedItem,setSearchedItem] = useState<string>("");

    const handleOnchange = (e : any) => {
        setSearchedItem(e.target.value);
    }

    const handleSearch = () => {
        setSearchedItem("")
    }
    

  return (
    <div>
        The food bible
        <input id='search-field' value={searchedItem} onChange={handleOnchange}/>
        <button id='search-button' onClick={handleSearch}>Search</button>
    </div>
  )
}

export default LandingPage