import { useState } from "react";
import { useGetBooksByEmailQuery } from "../../../redux/features/book/bookApi";
import { Link } from "react-router-dom";
import { TBook } from "../../../redux/features/book/bookSlice";
import { useAppSelector } from "../../../redux/hooks";
import { selectCurrentUser, TUser } from "../../../redux/features/auth/authSlice";
import { Table, Input, Tag, Space, Button } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Search } from "lucide-react";

const MyProducts = () => {
    const { email } = useAppSelector(selectCurrentUser) as TUser;
    const { data: responseData, isLoading } = useGetBooksByEmailQuery(email);
    const [searchText, setSearchText] = useState("");

    const products = responseData?.data || [];

    // Filter data based on search text across multiple fields
    const filteredProducts = products.filter((item: TBook) => {
        const searchLower = searchText.toLowerCase();
        const titleMatch = item?.bookTitle?.toLowerCase().includes(searchLower);
        const conditionMatch = item?.condition?.toLowerCase().includes(searchLower);
        const deliveryMatch = item?.deliveryOption?.toLowerCase().includes(searchLower);
        
        return titleMatch || conditionMatch || deliveryMatch;
    });

    const columns: ColumnsType<TBook> = [
        {
            title: 'Book Title',
            key: 'bookTitle',
            render: (_, record) => (
                <div className="flex items-center gap-x-3 whitespace-nowrap">
                    <img 
                        src={record?.images?.[0] || 'https://via.placeholder.com/150'} 
                        alt={record.bookTitle} 
                        className="w-10 h-10 rounded-full object-cover border border-gray-200" 
                    />
                    <div>
                        <span className="block text-gray-700 text-sm font-medium">{record.bookTitle}</span>
                    </div>
                </div>
            ),
        },
        {
            title: 'Price',
            dataIndex: 'price',
            key: 'price',
            render: (price) => <span className="font-medium whitespace-nowrap">৳ {price}</span>,
            sorter: (a, b) => (a.price || 0) - (b.price || 0),
        },
        {
            title: 'Condition',
            dataIndex: 'condition',
            key: 'condition',
            filters: [
                { text: 'New', value: 'New' },
                { text: 'Used', value: 'Used' },
                { text: 'Refurbished', value: 'Refurbished' },
            ],
            onFilter: (value: any, record) => record.condition === value,
            render: (condition) => {
                const color = condition?.toLowerCase() === 'new' ? 'green' : 
                              condition?.toLowerCase() === 'used' ? 'orange' : 'blue';
                return <Tag color={color}>{condition || 'N/A'}</Tag>;
            }
        },
        {
            title: 'Delivery Option',
            dataIndex: 'deliveryOption',
            key: 'deliveryOption',
            render: (option) => {
                const color = option?.toLowerCase() === 'free' ? 'cyan' : 'default';
                return <Tag color={color}>{option || 'N/A'}</Tag>;
            }
        },
        {
            title: 'Actions',
            key: 'actions',
            render: () => (
                <Space size="middle">
                    <Button type="link" className="text-yellow-600 hover:text-yellow-500 p-0 font-medium">Edit</Button>
                    <Button type="link" danger className="p-0 font-medium">Delete</Button>
                </Space>
            )
        }
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                        My Products
                    </h1>
                    <p className="mt-2 text-sm text-gray-500">
                        The products you have listed from this profile.
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3 items-center">
                    <Input
                        placeholder="Search by title or condition..."
                        prefix={<Search className="w-4 h-4 text-gray-400 mr-2" />}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        allowClear
                        size="large"
                        className="rounded-lg shadow-sm w-full md:w-80"
                    />
                    <Link to="/user/add-product" className="w-full sm:w-auto">
                        <Button 
                            type="primary" 
                            size="large" 
                            className="bg-yellow-600 hover:bg-yellow-500 border-none shadow-sm font-medium w-full"
                        >
                            Add Product
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="bg-white shadow-sm border border-gray-100 rounded-xl overflow-hidden">
                <Table
                    columns={columns}
                    dataSource={filteredProducts}
                    rowKey="_id"
                    loading={isLoading}
                    pagination={{
                        defaultPageSize: 5,
                        showSizeChanger: true,
                        pageSizeOptions: ['5', '10', '20'],
                        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} products`
                    }}
                    scroll={{ x: 800 }}
                    size="middle"
                    className="custom-table"
                />
            </div>
        </div>
    );
};

export default MyProducts;