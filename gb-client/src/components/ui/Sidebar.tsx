import { Menu } from "antd";
import Sider from "antd/es/layout/Sider";
import { LogoutOutlined } from "@ant-design/icons";
import { sidebarGenerator } from "../../utils/sidebarGenerator";
import { adminPaths } from "../../routes/admin.route";
import { userPaths } from "../../routes/user.route";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { logout, selectCurrentUser, TUser } from "../../redux/features/auth/authSlice";
import { isMobile } from "mobile-device-detect";
import { useNavigate } from "react-router-dom";

const Sidebar = ({ collapsed }: { collapsed: boolean }) => {
    const { role } = useAppSelector(selectCurrentUser) as TUser;
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const userRole = {
        ADMIN: "admin",
        USER: "user",
    };

    let sidebarItems;
    switch (role) {
        case userRole.ADMIN:
            sidebarItems = sidebarGenerator(adminPaths, userRole.ADMIN);
            break;
        case userRole.USER:
            sidebarItems = sidebarGenerator(userPaths, userRole.USER);
            break;
        default:
            break;
    }


    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    }
    return (
        <Sider
            trigger={null}
            collapsible
            collapsed={collapsed}
            className={`h-screen sticky top-0 ${collapsed && isMobile ? "hidden" : "block"
                }`}
            style={{ display: "flex", flexDirection: "column" }}
        >
            <a
                href="/"
                className="h-12 mx-auto p-4 flex justify-center items-center"
            >
                <img
                    src="https://res.cloudinary.com/dshjcmrd0/image/upload/v1771834927/grontho-bilash-transparent.png.png"
                    className="h-12 w-12"
                    alt="Logo"
                />
            </a>
            <div style={{ flex: 1, overflowY: "auto" }} className="flex flex-col 
            ">
                <Menu
                    theme="dark"
                    mode="inline"
                    defaultSelectedKeys={["1"]}
                    items={sidebarItems}
                />
            <div
                style={{
                    borderTop: "1px solid rgba(255,255,255,0.1)",
                    padding: collapsed ? "12px 8px" : "12px 16px",
                    transition: "padding 0.2s",
                }}
            >
                <button
                    onClick={() => { handleLogout() }}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        
                        gap: "10px",
                        width: "100%",
                        background: "transparent",
                        border: "1px solid rgba(255,255,255,0.15)",
                        borderRadius: "8px",
                        padding: collapsed ? "10px" : "10px 14px",
                        color: "rgba(255,255,255,0.65)",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        justifyContent: collapsed ? "center" : "flex-start",
                    }}
                    onMouseEnter={e => {
                        (e.currentTarget as HTMLButtonElement).style.background =
                            "rgba(255,77,79,0.15)";
                        (e.currentTarget as HTMLButtonElement).style.borderColor =
                            "rgba(255,77,79,0.5)";
                        (e.currentTarget as HTMLButtonElement).style.color = "#ff4d4f";
                    }}
                    onMouseLeave={e => {
                        (e.currentTarget as HTMLButtonElement).style.background =
                            "transparent";
                        (e.currentTarget as HTMLButtonElement).style.borderColor =
                            "rgba(255,255,255,0.15)";
                        (e.currentTarget as HTMLButtonElement).style.color =
                            "rgba(255,255,255,0.65)";
                    }}
                    title="Logout"
                >
                    <LogoutOutlined style={{ fontSize: "16px", flexShrink: 0 }} />
                    {!collapsed && (
                        <span style={{ fontSize: "14px", fontWeight: 500 }}>Logout</span>
                    )}
                </button>
            </div>
            </div>

         
        </Sider>
    );
};

export default Sidebar;