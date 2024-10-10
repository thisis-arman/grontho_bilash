
// const items = [UserOutlined, VideoCameraOutlined, UploadOutlined, UserOutlined].map(
//     (icon, index) => ({
//         key: String(index + 1),
//         icon: React.createElement(icon),
//         label: `nav ${index + 1}`,
//     }),
// );

import { NavLink } from "react-router-dom";

export const sidebarGenerator = (items) => {
    const sidebar = items.reduce((acc, item) => {
        acc.push({
            key: `${item.path}`,
            label: <NavLink to={item.path}>{ item.name}</NavLink>
        })



    }, []);
    return sidebar;
}