import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../reduxstore/store';
import {deleteUserItem, setError, setLoading, setUserItems } from '../reduxstore/userItemsSlice'
import ItemDisplay from '../components/ItemDisplay';
import ReadUserItem from '../components/ReadUserItem';
import type { Item } from '../utils/types';



const AccountPage = () => {

    const [displayItem,setDisplayItem] = useState<Item | null>();

    // const [availableRecipes,setAvailableRecipes] = useState<recipeFace[] | null>();
    const [recipesLoading,setRecipesLoading] = useState<boolean>(true);

    const {userItems,loading,error} = useSelector((state: RootState) => state.userItems);
    const {isAuthenticated,role} = useSelector((state: RootState) => state.auth);
    const {recipes}= useSelector((state: RootState) => state.items);
    const token = localStorage.getItem("token");
    const dispatch = useDispatch();

// load user items

    const loadUserItems = async () => {
        if(!token){
            console.log("No token available.")
            return;
        }
        dispatch(setLoading(true));
        try {
            const res = await fetch("/api/users/me/foods",{method: "GET",   
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if(res.ok){
                const data = await res.json();
                dispatch(setUserItems(data))
            } else {
                dispatch(setError("Failed to load user items."))
            }

            
        } catch (error) {
            dispatch(setError('Error loading user items'));
            console.log(error);
        }
    }

    useEffect(() => {
        if(isAuthenticated){
            loadUserItems();
        }
    },[isAuthenticated])

    const isReady = !loading && !recipesLoading &&  userItems.length > 0 && recipes.length > 0;

    // remove item from user items

    const handleRemoveUserItem = async (id: string) => {
        try {
            const res = await fetch(`/api/users/me/foods/${id}`,{method: "DELETE",
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            
            if(res.ok){
                dispatch(deleteUserItem(id))
            } else {
                console.log("failed to remove food from db")
            }
            
        } catch (error) {
            console.log("error removing food")
        }
    }

    const onUserItemClicked = (item : Item) => {
        setDisplayItem(item);
    }

    // use memo to reduce load time of available recipes

    const availableRecipes = useMemo(() => {
        if(!recipes.length || !userItems.length){
            setRecipesLoading(false)
            return [];
        }

        const userIngredientSet = new Set(userItems.map((item) => item.name.toLowerCase()));

        const matched = recipes.filter(recipe => {
            let matchCount = 0;
            for (const ing of recipe.ingredients){
                if(userIngredientSet.has(ing.toLowerCase())){
                    matchCount++
                    if(matchCount >= 2) return true;
                }
            }
            return false;
        })
        setRecipesLoading(false);
        return matched;
    },[recipes,userItems])

    const showRecipesToCookNow = () => {

    }


    // useEffect(() => {
    // // currently showing recipes that have 2 similar ingredients
    // const showRecipesToCook = async () => {
    //     setRecipesLoading(true)
    //     try {
    //         const recipesWithAtLeastTwoMatches = recipes.filter((recipe) =>{
    //             const matched = recipe.ingredients.filter((recipeIng) => userItems.some((userItemIng) => userItemIng.name.toLowerCase() === recipeIng.toLowerCase()))

    //             return matched.length >= 2;
    //         })
    //         setAvailableRecipes(recipesWithAtLeastTwoMatches);
    //     } catch (err) {
    //         console.log(err);
    //     } finally {
    //         setRecipesLoading(false);
    //     }
    // }
    // showRecipesToCook();
    // },[recipes,userItems])

    if(loading) return <>loading food data..</>
  return (
    <div id='accpage'>
        <div id='accinfo'>
            <h2>AccountPage</h2>    
            <p>{`Your foods: ${userItems.length}`}</p>
            <p>Your role: {role}</p>
        </div>
        {!isReady ? (<h3>Loading available recipes..</h3>) : (<h3>{`Available recipes: ${availableRecipes?.length}`}</h3>)}
        {displayItem ? <ReadUserItem  onClose={() => setDisplayItem(null)} foodItem={displayItem} /> : null}
        <div id='accrecipes'>
            <button onClick={() => showRecipesToCookNow()}>Test btn</button>
            {availableRecipes.map((recipe,i) => (
                <div key={i}>
                    <ItemDisplay itemToDisplay={recipe} onToggle={() => onUserItemClicked(recipe)}/>
                </div>
            ))}
        </div>
        <div id='youritems'>
        {userItems.length > 0 && userItems.map((userItem,i) => (
            <div className='youritem' key={i}>
                <button onClick={() => handleRemoveUserItem(userItem._id)}>🚫</button>
                <ItemDisplay itemToDisplay={userItem} onToggle={() => onUserItemClicked(userItem)}/>
            </div>))}
        </div>
    </div>
  )
}

export default AccountPage