import React, { useState } from "react";
import { useGetOrderByUserIdQuery } from "../../../redux/features/order/orderApi";
import { selectCurrentUser, TUser } from "../../../redux/features/auth/authSlice";
import { useAppSelector } from "../../../redux/hooks";
import { Table, Input, Tag, Space, Button } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Search } from "lucide-react";

const MyOrders = () => {
    const { id } = useAppSelector(selectCurrentUser) as TUser;
    const { data: responseData, isLoading } = useGetOrderByUserIdQuery(id);
    const [searchText, setSearchText] = useState("");

    const orders = responseData?.data || [];

    // Filter data based on search text across multiple fields
    const filteredOrders = orders.filter((order: any) => {
        const searchLower = searchText.toLowerCase();
        const orderIdMatch = order?.orderId?.toLowerCase().includes(searchLower);
        const titleMatch = order?.books?.some((book: any) => 
            book?.bookTitle?.toLowerCase().includes(searchLower)
        );
        const buyerMatch = order?.buyer?.name?.toLowerCase().includes(searchLower);
        const pStatusMatch = order?.paymentStatus?.toLowerCase().includes(searchLower);
        const oStatusMatch = order?.orderStatus?.toLowerCase().includes(searchLower);
        
        return orderIdMatch || titleMatch || buyerMatch || pStatusMatch || oStatusMatch;
    });

    const columns: ColumnsType<any> = [
        {
            title: 'Order ID',
            dataIndex: 'orderId',
            key: 'orderId',
            render: (text) => <span className="font-semibold text-gray-700">#{text?.substring(0, 8) || 'N/A'}...</span>,
        },
        {
            title: 'Products',
            key: 'products',
            render: (_, record) => (
                <div className="flex flex-col gap-1 min-w-[150px]">
                    {record.books?.map((book: any, i: number) => (
                        <span key={i} className="text-sm text-gray-600 line-clamp-1 block">
                            • {book.bookTitle}
                        </span>
                    ))}
                </div>
            ),
        },
        {
            title: 'Buyer',
            dataIndex: ['buyer', 'name'],
            key: 'buyer',
            render: (name) => <span className="text-gray-700">{name || 'N/A'}</span>,
        },
        {
            title: 'Total Amount',
            dataIndex: 'totalAmount',
            key: 'totalAmount',
            render: (amount) => <span className="font-medium whitespace-nowrap">৳ {amount}</span>,
            sorter: (a, b) => (a.totalAmount || 0) - (b.totalAmount || 0),
        },
        {
            title: 'Payment Status',
            dataIndex: 'paymentStatus',
            key: 'paymentStatus',
            render: (status) => {
                const color = status === 'Paid' ? 'green' : status === 'Failed' ? 'red' : 'orange';
                return <Tag color={color}>{status || 'Pending'}</Tag>;
            }
        },
        {
            title: 'Order Status',
            dataIndex: 'orderStatus',
            key: 'orderStatus',
            filters: [
                { text: 'Pending', value: 'Pending' },
                { text: 'Processing', value: 'Processing' },
                { text: 'Shipped', value: 'Shipped' },
                { text: 'Delivered', value: 'Delivered' },
            ],
            onFilter: (value: any, record) => record.orderStatus === value,
            render: (status) => {
                const color = status === 'Delivered' ? 'success' : 
                              status === 'Pending' ? 'warning' : 
                              status === 'Shipped' ? 'blue' : 'processing';
                return <Tag color={color}>{status || 'Processing'}</Tag>;
            },
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
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
                        My Orders
                    </h1>
                    <p className="mt-2 text-sm text-gray-500">
                        Search and manage your recent product orders
                    </p>
                </div>
                <div className="w-full md:w-80">
                    <Input
                        placeholder="Search by ID, product, or status..."
                        prefix={<Search className="w-4 h-4 text-gray-400 mr-2" />}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        allowClear
                        size="large"
                        className="rounded-lg shadow-sm"
                    />
                </div>
            </div>

            <div className="bg-white shadow-sm border border-gray-100 rounded-xl overflow-hidden">
                <Table
                    columns={columns}
                    dataSource={filteredOrders}
                    rowKey="_id"
                    loading={isLoading}
                    pagination={{
                        defaultPageSize: 5,
                        showSizeChanger: true,
                        pageSizeOptions: ['5', '10', '20'],
                        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} orders`
                    }}
                    scroll={{ x: 800 }}
                    size="middle"
                    className="custom-table"
                />
            </div>
        </div>
    );
};

export default MyOrders;