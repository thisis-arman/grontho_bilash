import { ReactNode } from "react";
import { useCurrentToken } from "../../redux/features/auth/authSlice";
import { useAppSelector } from "../../redux/hooks";
import { useNavigate } from "react-router-dom";

const PrivateRoute = ({ children }: { children: ReactNode }) => {
const navigate = useNavigate()

    const token = useAppSelector(useCurrentToken);

    if (!token) { 
       return navigate('/login')
    }



    return children;
};

export default PrivateRoute;