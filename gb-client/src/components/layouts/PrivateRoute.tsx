import { jwtDecode } from "jwt-decode";
import { useCurrentToken } from "../../redux/features/auth/authSlice";
import { useAppSelector } from "../../redux/hooks";

import  { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';


const PrivateRoute = ({ children, roles }: { children: ReactNode; roles?: string[] }) => {
    const token = useAppSelector(useCurrentToken);
    const location = useLocation();

    // Remember where the visitor was heading so Login can send them back.
    const toLogin = <Navigate to="/login" replace state={{ from: location.pathname }} />;

    if (!token) {
        return toLogin;
    }

    let decodedToken: { exp?: number; role?: string };
    try {
        decodedToken = jwtDecode(token);
    } catch {
        return toLogin;
    }
    const currentTime = Math.floor(Date.now() / 1000);

    if (!decodedToken.exp || decodedToken.exp <= currentTime) {
        return toLogin;
    }

    // The API enforces roles too; this just keeps people out of screens
    // that would only show them errors.
    if (roles && !roles.includes(decodedToken.role ?? "")) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};


export default PrivateRoute;
