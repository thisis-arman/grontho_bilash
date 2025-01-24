// import { ReactNode } from "react";
import { useCurrentToken } from "../../redux/features/auth/authSlice";
import { useAppSelector } from "../../redux/hooks";
// import { useNavigate } from "react-router-dom"

import React, { ReactNode } from 'react';

import { Navigate } from 'react-router-dom';



const PrivateRoute = ({ children }: { children: ReactNode }) => {
    const isAuthenticated = useAppSelector(useCurrentToken);
    if (!isAuthenticated) {

        return <Navigate to="/login" />;

    }
    return <>{children}</>;

};



export default PrivateRoute;