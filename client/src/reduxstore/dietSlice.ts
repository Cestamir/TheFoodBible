import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { Diet } from "../utils/types";

interface DietState{
    diets: Diet[],
}

const initialState : DietState = {
    diets: [],
}

const dietSlice = createSlice({
    name: "diet",
    initialState,
    reducers: {
        setDiets: (state,action : PayloadAction<Diet[]>) => {
            state.diets = action.payload;
        },
        addDiet: (state,action : PayloadAction<Diet>) => {
            state.diets.push(action.payload);
        },
        deleteDiet: (state,action : PayloadAction<string>) => {
            state.diets = state.diets.filter((d) => d._id !== action.payload)
        },
        updateDiet: (state,action : PayloadAction<Diet>) => {
            const index = state.diets.findIndex((d) => d._id === action.payload._id)
            if(index !== -1){
                state.diets[index] = action.payload;
            }
        }
    }
})

export const {
    setDiets,
    addDiet,
    deleteDiet,
    updateDiet,
} = dietSlice.actions;

export default dietSlice.reducer;