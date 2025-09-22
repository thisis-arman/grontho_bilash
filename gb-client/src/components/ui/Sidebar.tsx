import { Menu } from "antd";
import Sider from "antd/es/layout/Sider";
import { sidebarGenerator } from "../../utils/sidebarGenerator";
import { adminPaths } from "../../routes/admin.route";
import { userPaths } from "../../routes/user.route";
import { useAppSelector } from "../../redux/hooks";
import { selectCurrentUser, TUser } from "../../redux/features/auth/authSlice";

const Sidebar = ({ collapsed }: { collapsed: boolean }) => {
    const {role} = useAppSelector(selectCurrentUser) as TUser;

    const userRole = {
        "ADMIN": 'admin',
        "USER": 'user'
    }
    let sidebarItems;

    switch (role) {
        case userRole.ADMIN:
            sidebarItems = sidebarGenerator(adminPaths, userRole.ADMIN)
            break;
        case userRole.USER:
            sidebarItems = sidebarGenerator(userPaths, userRole.USER)
            break;

        default:
            break;
    }
    console.log("sidebar items_______",sidebarItems);
    return (
        <Sider trigger={null} collapsible collapsed={collapsed} className="h-screen sticky top-0">
            <a href="/" className="demo-logo-vertical h-12 mx-auto p-4 flex justify-center items-center " >
                {/* <h1 className='text-white font-bold text-2xl'>GB</h1> */}
                <img src="/src/assets/logo/grontho-bilash-transparent.png" className='h-12 w-12' alt="" />
            </a>
            <Menu
                theme="dark"
                mode="inline"
                defaultSelectedKeys={['1']}
                items={sidebarItems}
            />
        </Sider>
    );
};

export default Sidebar;