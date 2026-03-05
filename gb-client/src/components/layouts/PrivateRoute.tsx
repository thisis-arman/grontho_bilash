import { jwtDecode } from "jwt-decode";
import { useCurrentToken } from "../../redux/features/auth/authSlice";
import { useAppSelector } from "../../redux/hooks";
// import { useNavigate } from "react-router-dom"

import  { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';


const PrivateRoute = ({ children }: { children: ReactNode }) => {
    const isAuthenticated = useAppSelector(useCurrentToken);

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    const decodedToken = jwtDecode(isAuthenticated as string);
    console.log({decodedToken})
    const currentTime = Math.floor(Date.now() / 1000);

    if (!decodedToken.exp || decodedToken.exp <= currentTime) {
        return <Navigate to="/login" />;
    }

    return <>{children}</>;
};


export default PrivateRoute;