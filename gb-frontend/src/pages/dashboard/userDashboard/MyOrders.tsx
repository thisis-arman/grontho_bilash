import { useGetOrderByUserIdQuery } from "../../../redux/features/order/orderApi";
import { selectCurrentUser, TUser } from "../../../redux/features/auth/authSlice";

import { useAppSelector } from "../../../redux/hooks";
// import { useGetBooksByEmailQuery } from "../../../redux/features/order/orderApi";
const MyOrders = () => {

        // const { data, isLoading } = useGetBooksQuery(undefined);
        const { id } = useAppSelector(selectCurrentUser) as TUser;

        console.log({id});
        console.log(id);
        const { data, isLoading } = useGetOrderByUserIdQuery(id);
        console.log({ data });
    return (
        <div>
            my product that being sold
        </div>
    );
};

export default MyOrders;