import React from 'react'
import type{ RootState } from './reduxstore/store'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'

interface Props{
    allowedRoutes: string[]
    children: React.ReactNode
}

const ProtectedRoute: React.FC<Props> = ({allowedRoutes,children}) => {

    const {isAuthenticated, role} = useSelector((state: RootState) => state.auth)

    if(!isAuthenticated) return <Navigate to={"/login"}/>;
    if (!role || !allowedRoutes.includes(role)) return <Navigate to={"/unauthorized"}/>;

  return <>{children}</>
}

export default ProtectedRoute