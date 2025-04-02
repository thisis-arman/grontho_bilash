import { useGetBooksByEmailQuery } from "../../../redux/features/book/bookApi";
import { selectCurrentUser, TUser } from "../../../redux/features/auth/authSlice";
import { useGetOrderByUserIdQuery } from "../../../redux/features/order/orderApi";
import { useAppSelector } from "../../../redux/hooks";
import ReuseableCard from "./components/ReuseableCard";


const UserDashboard = () => {

    const { id, email } = useAppSelector(selectCurrentUser) as TUser;

    const { data: orderData, isLoading } = useGetOrderByUserIdQuery(id);
    const totalSpentAmount = orderData?.data?.reduce((acc: number, data) => acc + data.totalAmount, 0);
    const { data: bookData } = useGetBooksByEmailQuery(email);

    return (
        <div>
            {/* OVERVIEW */}
        
            {isLoading ? "loading..." : <section className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 justify-center items-center gap-4 ">

                <ReuseableCard
                    amount={totalSpentAmount}
                    icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}       stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>}
                    stat={'+20.1% from last month'}
                    title={'Total Spent'}
                />
                <ReuseableCard
                    amount={bookData?.data?.length}
                    icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}       stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>}
                    stat={'+2.1% from last month'}
                    title={'Total Books'}
                />
                <ReuseableCard
                    amount={bookData?.data?.length}
                    icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}       stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>}
                    stat={'+2.1% from last month'}
                    title={'Total Books'}
                />
                <ReuseableCard
                    amount={bookData?.data?.length}
                    icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}       stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>}
                    stat={'+2.1% from last month'}
                    title={'Total Books'}
                />


              
            </section>
            }
        </div>

    );
};

export default UserDashboard;