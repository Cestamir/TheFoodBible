import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { foodFace } from "../utils/types";

interface userItemsState {
    userItems: foodFace[],
    loading: boolean,
    error: string | null,
}

const initialState : userItemsState = {
    userItems: [],
    loading: false,
    error: null,
}

const userItemsSlice = createSlice({
    name: 'userItems',
    initialState,
    reducers: {
        setUserItems: (state,action : PayloadAction<foodFace[]>) => {
            state.userItems = action.payload;
            state.loading = false;
            state.error = null;
        },
        addUserItem: (state,action : PayloadAction<foodFace>) => {
            state.userItems.push(action.payload);
        },
        deleteUserItem: (state,action : PayloadAction<string>) => {
            state.userItems = state.userItems.filter((item) => item._id !== action.payload)
        },
        updateUserItem: (state,action : PayloadAction<foodFace>) => {
            const index = state.userItems.findIndex((item) => item._id === action.payload._id);
            if(index !== -1){
                state.userItems[index] = action.payload;
            }
        },
        clearUserItems: (state) => {
            state.userItems = [];
            state.loading = false;
            state.error = null;
        },
        setLoading: (state,action : PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setError: (state,action : PayloadAction<string>) => {
            state.error = action.payload;
        }
    }
})

export const {
    setUserItems,
    addUserItem,
    deleteUserItem,
    updateUserItem,
    clearUserItems,
    setLoading,
    setError,
} = userItemsSlice.actions;

export default userItemsSlice.reducer;