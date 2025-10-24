import {configureStore} from '@reduxjs/toolkit'
import authReducer from './authSlice.ts'
import itemsReducer from './itemsSlice.ts'

export const store = configureStore({reducer: {
    auth: authReducer,
    items: itemsReducer,
},});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

