// import { ReactNode } from "react";
import { jwtDecode } from "jwt-decode";
import { useCurrentToken } from "../../redux/features/auth/authSlice";
import { useAppSelector } from "../../redux/hooks";
// import { useNavigate } from "react-router-dom"

import  { ReactNode } from 'react';

import { Navigate } from 'react-router-dom';



const PrivateRoute = ({ children }: { children: ReactNode }) => {
    const isAuthenticated = useAppSelector(useCurrentToken);
   const decodedToken = jwtDecode(isAuthenticated  as string);
   const currentTime = Math.floor(Date.now() / 1000);

   console.log(decodedToken.exp! > currentTime);

    if (!isAuthenticated && decodedToken.exp! > currentTime) {

        return <Navigate to="/login" />;

    }
    return <>{children}</>;

};



export default PrivateRoute;