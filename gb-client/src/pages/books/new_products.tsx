import BookCard from './bookCard';
import { useGetBooksQuery } from '../../redux/features/book/bookApi';


export type TBook = {
    _id: string,
    user: string,
    bookTitle: string;
    price: number;
    description: string;
    condition: "fresh" | "used";
    level: string;
    faculty: string;
    department: string;
    isPublished: boolean;
    isContactNoHidden: boolean;
    isNegotiable: boolean;
    images: string[];
    publicationYear: number;
    transactionDate?: Date;
    location: string;
    deliveryOption: "pickup" | "shipping";
    shippingCost?: number;
};
const Products = () => {

    const { data: books, isLoading } = useGetBooksQuery(undefined);
    if (isLoading) {
        return <div className='w-full h-screen h-full flex justify-center items-center'>loading....</div>
    }
    console.log({books});
    return (
        <div>

            <div className="bg-white w-full col-span-3 ">
                <div className="mx-auto  px-4  sm:px-6 lg:px-8 my-8">
                    <h2 className="text-4xl font-bold tracking-tight text-gray-900 py-8">Products</h2>
                    <BookCard  products={books?.data} />
                </div>
            </div>

        </div>
    );
};

export default Products;