import { useState } from "react";
import { useGetUsersQuery, useUpdateUserInfoMutation } from "../../../redux/features/user/userApi";

import { Modal } from "antd";

type TUser= {
    name: string;
    email: string;
    contactNo: string;
    password: string;
    needsUpdateProfile: boolean;
    passwordChangedAt ?: Date;
    role: "user" | "admin";
    status: "active" | "blocked";
    isDeleted: boolean;
}


const UserManagement = () => {

    
    const { data, isLoading } = useGetUsersQuery(undefined);
    // const [updateUserInfo,result]=useUpdateUserInfoMutation();

     const [open, setOpen] = useState(false);
      const [confirmLoading, setConfirmLoading] = useState(false);
      const [modalText, setModalText] = useState('Content of the modal');
    
      const showModal = () => {
        setOpen(true);
      };
    
      const handleOk = () => {
        setModalText('The modal will be closed after two seconds');
        setConfirmLoading(true);
        setTimeout(() => {
          setOpen(false);
          setConfirmLoading(false);
        }, 2000);
      };
    
      const handleCancel = () => {
        console.log('Clicked cancel button');
        setOpen(false);
      };
 

    return (
        <>
            {isLoading ? <div className="w-full mx-auto flex justify-center items-center"><p>Loading...</p>
            </div > : <div className="max-w-screen-xl mx-auto px-4 md:px-8">
                <div className="items-start justify-between md:flex">
                    <div className="max-w-lg">
                        <h3 className="text-gray-800 text-xl font-bold sm:text-2xl">
                            Team members
                        </h3>
                        <p className="text-gray-600 mt-2">
                            Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                        </p>
                    </div>
                    <div className="mt-3 md:mt-0">
                        <a
                            href="javascript:void(0)"
                            className="inline-block px-4 py-2 text-white duration-150 font-medium bg-indigo-600 rounded-lg hover:bg-indigo-500 active:bg-indigo-700 md:text-sm"
                        >
                            Add member
                        </a>
                    </div>
                </div>
                <div className="mt-12 shadow-sm border rounded-lg overflow-x-auto">
                    <table className="w-full table-auto text-sm text-left">
                        <thead className="bg-gray-50 text-gray-600 font-medium border-b">
                            <tr>
                                <th className="py-3 px-6">Username</th>
                                <th className="py-3 px-6">Contact No</th>
                                <th className="py-3 px-6">Role</th>
                                <th className="py-3 px-6">Status</th>
                                <th className="py-3 px-6"></th>

                            </tr>
                        </thead>
                        <tbody className="text-gray-600 divide-y">
                            {
                                data?.data?.map((item:TUser, idx: number) => (
                                    <tr key={idx}>
                                        <td className="flex items-center gap-x-3 py-3 px-6 whitespace-nowrap">
                                            {/* <img src={item?.avatar} className="w-10 h-10 rounded-full" /> */}
                                            <div>
                                                <span className="block text-gray-700 text-sm font-medium">{item.name}</span>
                                                <span className="block text-gray-700 text-xs">{item.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">{item.contactNo}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{item.role}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{item.status}</td>
                                        <td className="text-right px-6 whitespace-nowrap">
                                            <a onClick={showModal}
                                                className="py-2 px-3 font-medium text-indigo-600 hover:text-indigo-500 duration-150 hover:bg-gray-50 rounded-lg">
                                                Edit
                                            </a>
                                            <button className="py-2 leading-none px-3 font-medium text-red-600 hover:text-red-500 duration-150 hover:bg-gray-50 rounded-lg">
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                </div>
            </div>
            }
            <Modal
        title="Title"
        open={open}
        onOk={handleOk}
        confirmLoading={confirmLoading}
        onCancel={handleCancel}
      >
        <p>{modalText}</p>
      </Modal>
        </>
    );
};

export default UserManagement;