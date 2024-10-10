import { Menu } from "antd";
import Sider from "antd/es/layout/Sider";
import { sidebarGenerator } from "../../utils/sidebarGenerator";
import { adminPaths } from "../../routes/admin.route";
import { userPaths } from "../../routes/user.route";

const Sidebar = ({ collapsed }: { collapsed: boolean }) => {
    const role = 'user';

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
    return (
        <Sider trigger={null} collapsible collapsed={collapsed}>
            <div className="demo-logo-vertical h-12 mx-auto p-4 flex justify-center items-center " >
                {/* <h1 className='text-white font-bold text-2xl'>GB</h1> */}
                <img src="/src/assets/logo//grontho-bilash-transparent.png" className='h-12 w-12' alt="" />
            </div>
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