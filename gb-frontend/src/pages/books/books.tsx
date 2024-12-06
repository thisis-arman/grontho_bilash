import { useGetBooksQuery } from 'src/redux/features/book/bookApi.ts';

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

    const { data:books, isLoading } = useGetBooksQuery(undefined);
  

    if (isLoading) {
        return <div className='w-full h-full flex justify-center items-center'> loading....</div>
    }
    return (


        <div className="bg-white">
            <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
                <h2 className="text-2xl font-bold tracking-tight text-gray-900">Customers also purchased</h2>

                <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
                    {books.data.map((product:TBook) => (
                        <div key={product._id} className="group relative">
                            <img
                                alt={product.bookTitle}
                                src={product.images[0]}
                                className="aspect-square w-full rounded-md bg-gray-200 object-cover group-hover:opacity-75 lg:aspect-auto lg:h-80"
                            />
                            <div className="mt-4 flex justify-between">
                                <div>
                                    <h3 className="text-sm text-gray-700">
                                        <a href={product._id}>
                                            <span aria-hidden="true" className="absolute inset-0" />
                                            {product.bookTitle}
                                        </a>
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500">{product.condition}</p>
                                </div>
                                <p className="text-sm font-medium text-gray-900">{product.price}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

  



export default Products;