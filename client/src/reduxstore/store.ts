import {configureStore} from '@reduxjs/toolkit'
import authReducer from './authSlice.ts'
import itemsReducer from './itemsSlice.ts'
import dietReducer from './dietSlice.ts'
import userItemsReducer from './userItemsSlice.ts'

export const store = configureStore({reducer: {
    auth: authReducer,
    items: itemsReducer,
    diet: dietReducer,
    userItems: userItemsReducer,
},});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

