import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

type Role = "admin" | "user" | "viewer";


interface authState{
    token: string | null
    role: Role | null
    isAuthenticated: boolean
}

const initialState : authState = {
    token: localStorage.getItem("token"),
    role: localStorage.getItem("role") as Role,
    isAuthenticated: !!localStorage.getItem("token")
}

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers : {
        login: (state,action : PayloadAction<{token: string;role: Role}>) => {
            state.token = action.payload.token;
            state.role = action.payload.role;
            state.isAuthenticated = true;
            localStorage.setItem("token",action.payload.token);
            localStorage.setItem("role",action.payload.role);
        },
        logout : (state) => {
            state.token = null;
            state.role = null;
            state.isAuthenticated = false;
            localStorage.removeItem("token")
            localStorage.removeItem("role");
        }

    }
})

export const {login,logout} = authSlice.actions;
export default authSlice.reducer;

