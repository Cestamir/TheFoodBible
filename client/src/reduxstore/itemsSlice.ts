import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { foodFace,recipeFace } from "../utils/types";

interface ItemsState{
    foods: foodFace[],
    recipes: recipeFace[],
    loading: boolean,
    error: string | null;
}

const initialState : ItemsState = {
    foods: [],
    recipes: [],
    loading: false,
    error: null,
}

const itemsSlice = createSlice({
    name: "items",
    initialState,
    reducers: {
        setFoods: (state,action : PayloadAction<foodFace[]>) => {
            state.foods = action.payload;
        },
        setRecipes: (state,action : PayloadAction<recipeFace[]>) => {
            state.recipes = action.payload;
        },
        addFood: (state,action : PayloadAction<foodFace>) => {
            state.foods.push(action.payload);
        },
        addRecipe: (state,action : PayloadAction<recipeFace>) => {
            state.recipes.push(action.payload);
        },
        updateFood: (state,action : PayloadAction<foodFace>) => {
            const index = state.foods.findIndex(food => food._id === action.payload._id);
            if(index !== -1){
                state.foods[index] = action.payload;
            }
        },
        updateRecipe: (state,action : PayloadAction<recipeFace>) => {
            const index = state.recipes.findIndex(recipe => recipe._id === action.payload._id);
            if(index !== -1){
                state.recipes[index] = action.payload;
            }
        },
        deleteFood: (state,action : PayloadAction<string>) => {
            state.foods = state.foods.filter((food) => food._id !== action.payload);
        },
        deleteRecipe: (state,action : PayloadAction<string>) => {
            state.recipes = state.recipes.filter((recipe) => recipe._id !== action.payload);
        },
        setLoading: (state,action : PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setError: (state,action : PayloadAction<string | null>) => {
            state.error = action.payload;
        },
    }
})

export const {
    setFoods,
    setRecipes,
    addFood,
    addRecipe,
    updateFood,
    updateRecipe,
    deleteFood,
    deleteRecipe,
    setLoading,
    setError,
} = itemsSlice.actions;

export default itemsSlice.reducer;
