import { useState } from "react";
import { 
    useGetOrderByUserIdQuery, 
    useDeleteOrderMutation, 
    useUpdateOrderMutation 
} from "../../../redux/features/order/orderApi";
import { selectCurrentUser, TUser } from "../../../redux/features/auth/authSlice";
import { useAppSelector } from "../../../redux/hooks";
import { Table, Input, Tag, Space, Button, Popconfirm, Modal, Form, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Search, Download, PackageOpen, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";

const MyOrders = () => {
    const { id } = useAppSelector(selectCurrentUser) as TUser;
    const { data: responseData, isLoading } = useGetOrderByUserIdQuery(id);
    const [deleteOrder, { isLoading: isDeleting }] = useDeleteOrderMutation();
    const [updateOrder, { isLoading: isUpdating }] = useUpdateOrderMutation();

    const [searchText, setSearchText] = useState("");
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [editingOrder, setEditingOrder] = useState<any>(null);
    const [form] = Form.useForm();

    const orders = responseData?.data || [];

    // Improve searchability by handling nulls and stringifying all relevant data
    const filteredOrders = orders.filter((order: any) => {
        const searchLower = searchText.toLowerCase();
        const orderIdMatch = order?.orderId?.toLowerCase().includes(searchLower);
        const titleMatch = order?.books?.some((item: any) => 
            item?.bookTitle?.toLowerCase().includes(searchLower)
        );
        const statusMatch = order?.orderStatus?.toLowerCase().includes(searchLower);
        const paymentMatch = order?.paymentStatus?.toLowerCase().includes(searchLower);
        
        return orderIdMatch || titleMatch || statusMatch || paymentMatch;
    });

    const handleDelete = async (orderId: string) => {
        try {
            await deleteOrder(orderId).unwrap();
            toast.success("Order deleted successfully");
        } catch (error) {
            toast.error("Failed to delete order");
        }
    };

    const handleEditClick = (record: any) => {
        setEditingOrder(record);
        form.setFieldsValue({
            deliveryAddress: record.deliveryAddress,
            phoneNumber: record.phoneNumber,
        });
        setIsEditModalVisible(true);
    };

    const handleEditSubmit = async (values: any) => {
        if (!editingOrder) return;
        try {
            await updateOrder({ 
                id: editingOrder._id, 
                data: values 
            }).unwrap();
            toast.success("Order updated successfully");
            setIsEditModalVisible(false);
            setEditingOrder(null);
            form.resetFields();
        } catch (error) {
            toast.error("Failed to update order");
        }
    };

    const columns: ColumnsType<any> = [
        {
            title: 'Order ID',
            dataIndex: 'orderId',
            key: 'orderId',
            width: 140,
            render: (text) => (
                <span className="font-semibold text-stone-800">
                    {text || 'N/A'}
                </span>
            ),
        },
        {
            title: 'Products',
            key: 'products',
            render: (_, record) => (
                <div className="flex flex-col gap-2 min-w-[200px]">
                    {record.books?.map((item: any, i: number) => (
                        <div key={i} className="flex flex-col gap-1">
                            <span className="text-sm font-medium text-stone-700 line-clamp-2">
                                • {item.bookTitle}
                            </span>
                            {item.book?.productType === 'Digital' && record.paymentStatus?.toLowerCase() === 'paid' && item.book?.digitalDetails?.downloadUrl && (
                                <a 
                                    href={item.book.digitalDetails.downloadUrl} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="text-xs font-semibold text-violet-600 hover:text-violet-800 underline ml-3 flex items-center gap-1 w-fit bg-violet-50 px-2.5 py-1 rounded-md transition-colors border border-violet-100"
                                >
                                    <Download size={12} /> Download Softcover
                                </a>
                            )}
                        </div>
                    ))}
                </div>
            ),
        },
        {
            title: 'Amount',
            dataIndex: 'totalAmount',
            key: 'totalAmount',
            width: 120,
            render: (amount) => (
                <span className="font-bold text-stone-900 whitespace-nowrap">
                    ৳{amount?.toLocaleString('en-IN')}
                </span>
            ),
            sorter: (a, b) => (a.totalAmount || 0) - (b.totalAmount || 0),
        },
        {
            title: 'Payment',
            dataIndex: 'paymentStatus',
            key: 'paymentStatus',
            width: 120,
            render: (status) => {
                const s = status?.toLowerCase() || 'pending';
                const map: Record<string, string> = {
                    "paid": "bg-emerald-50 text-emerald-700 border-emerald-200",
                    "failed": "bg-rose-50 text-rose-700 border-rose-200",
                    "pending": "bg-amber-50 text-amber-700 border-amber-200",
                    "partially-paid": "bg-sky-50 text-sky-700 border-sky-200",
                };
                return (
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border uppercase tracking-wider ${map[s] || map["pending"]}`}>
                        {status || 'Pending'}
                    </span>
                );
            }
        },
        {
            title: 'Order Status',
            dataIndex: 'orderStatus',
            key: 'orderStatus',
            width: 130,
            filters: [
                { text: 'Pending', value: 'pending' },
                { text: 'Confirmed', value: 'confirmed' },
                { text: 'Shipped', value: 'shipped' },
                { text: 'Delivered', value: 'delivered' },
                { text: 'Cancelled', value: 'cancelled' },
            ],
            onFilter: (value: any, record) => record.orderStatus?.toLowerCase() === value,
            render: (status) => {
                const s = status?.toLowerCase() || 'pending';
                const map: Record<string, string> = {
                    "delivered": "bg-emerald-50 text-emerald-700 border-emerald-200",
                    "shipped": "bg-indigo-50 text-indigo-700 border-indigo-200",
                    "confirmed": "bg-sky-50 text-sky-700 border-sky-200",
                    "pending": "bg-amber-50 text-amber-700 border-amber-200",
                    "cancelled": "bg-stone-100 text-stone-600 border-stone-200",
                };
                return (
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border uppercase tracking-wider ${map[s] || map["pending"]}`}>
                        {status || 'Processing'}
                    </span>
                );
            },
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 140,
            render: (_, record) => {
                // Determine if order is editable/deletable
                // Usually, orders can only be edited/cancelled if pending
                const isPending = record.orderStatus?.toLowerCase() === 'pending';

                return (
                    <Space size={8}>
                        <button 
                            onClick={() => handleEditClick(record)}
                            disabled={!isPending}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                                isPending 
                                    ? "text-stone-700 bg-stone-100 hover:bg-stone-200" 
                                    : "text-stone-400 bg-stone-50 cursor-not-allowed"
                            }`}
                        >
                            Edit
                        </button>
                        <Popconfirm
                            title="Delete the order"
                            description="Are you sure to delete this order?"
                            onConfirm={() => handleDelete(record._id)}
                            okText="Yes"
                            cancelText="No"
                            disabled={!isPending}
                        >
                            <button 
                                disabled={!isPending}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                                    isPending 
                                        ? "text-rose-600 bg-rose-50 hover:bg-rose-100" 
                                        : "text-stone-400 bg-stone-50 cursor-not-allowed"
                                }`}
                            >
                                Delete
                            </button>
                        </Popconfirm>
                    </Space>
                );
            }
        }
    ];

    return (
        <div className="min-h-screen bg-stone-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
                            Purchase History
                        </h1>
                        <p className="mt-1 text-sm text-stone-500">
                            Track and manage your past and current book orders
                        </p>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                        <input
                            type="text"
                            placeholder="Search by ID, title, or status..."
                            value={searchText}
                            onChange={e => setSearchText(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all shadow-sm"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white shadow-sm border border-stone-100 rounded-2xl overflow-hidden">
                    <Table
                        columns={columns}
                        dataSource={filteredOrders}
                        rowKey="_id"
                        loading={isLoading}
                        pagination={{
                            defaultPageSize: 8,
                            showSizeChanger: true,
                            pageSizeOptions: ['8', '16', '32'],
                            showTotal: (total, range) => `${range[0]}–${range[1]} of ${total} orders`,
                            className: "px-4 py-2"
                        }}
                        scroll={{ x: 900 }}
                        size="middle"
                        rowClassName="hover:bg-stone-50/50 transition-colors"
                        locale={{
                            emptyText: (
                                <div className="py-16 flex flex-col items-center gap-3">
                                    <PackageOpen className="w-10 h-10 text-stone-200" />
                                    <p className="text-sm text-stone-400 font-medium">No orders found</p>
                                </div>
                            ),
                        }}
                    />
                </div>
            </div>

            {/* Edit Order Modal */}
            <Modal
                title={
                    <div className="text-lg font-bold text-stone-800">
                        Edit Order Info
                    </div>
                }
                open={isEditModalVisible}
                onCancel={() => {
                    setIsEditModalVisible(false);
                    setEditingOrder(null);
                    form.resetFields();
                }}
                footer={null}
                centered
            >
                <div className="mb-4 p-3 bg-amber-50 border border-amber-100 rounded-lg">
                    <p className="text-xs text-amber-800 font-medium leading-relaxed">
                        Note: You can only update your delivery details while the order is still pending. Once processed, you'll need to contact support.
                    </p>
                </div>
                
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleEditSubmit}
                    requiredMark={false}
                >
                    <Form.Item
                        name="deliveryAddress"
                        label={<span className="text-sm font-semibold text-stone-700">Delivery Address</span>}
                        rules={[{ required: true, message: 'Please input your delivery address!' }]}
                    >
                        <Input.TextArea 
                            rows={3} 
                            placeholder="Enter full shipping address"
                            className="rounded-xl border-stone-200 hover:border-amber-400 focus:border-amber-500 focus:ring-amber-500/20 transition-all resize-none"
                        />
                    </Form.Item>

                    <Form.Item
                        name="phoneNumber"
                        label={<span className="text-sm font-semibold text-stone-700">Contact Number</span>}
                        rules={[{ required: true, message: 'Please input your phone number!' }]}
                    >
                        <Input 
                            prefix={<Phone size={14} className="text-stone-400 mr-1" />}
                            placeholder="Enter contact number" 
                            className="rounded-xl py-2 border-stone-200 hover:border-amber-400 focus:border-amber-500 focus:ring-amber-500/20 transition-all"
                        />
                    </Form.Item>

                    <Form.Item className="mb-0 mt-6 flex justify-end">
                        <Space>
                            <Button 
                                onClick={() => setIsEditModalVisible(false)}
                                className="rounded-xl font-medium border-stone-200 text-stone-600 hover:text-stone-800 hover:border-stone-300"
                            >
                                Cancel
                            </Button>
                            <Button 
                                type="primary" 
                                htmlType="submit" 
                                loading={isUpdating}
                                className="rounded-xl font-semibold bg-amber-500 hover:bg-amber-600 border-transparent shadow-sm hover:shadow-md transition-all px-6"
                            >
                                Save Changes
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default MyOrders;