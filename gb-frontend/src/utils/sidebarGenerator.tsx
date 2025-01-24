
import { NavLink } from "react-router-dom";

interface SidebarItem {
    key: string;
    label: JSX.Element | string;
    children?: SidebarItem[];
}

interface Item {
    path?: string;
    name: string;
    children?: Item[];
}

export const sidebarGenerator = (items: Item[], role: string): SidebarItem[] => {
    console.log({ items });
    const sidebar = items.reduce<SidebarItem[]>((acc, item) => {
        console.log(acc, item);
        if (item.path && item.name) {
            acc.push({
                key: item.name,
                label: <NavLink to={`/${role}/${item.path}`}>{item.name}</NavLink>,
            });
        }

        if (item.children) {
            acc.push({
                key: item.name,
                label: item.name,
                children: item.children.map((child) => ({
                    key: child.name,
                    label: <NavLink to={`/${role}/${child.path}`}>{child.name}</NavLink>,
                })),
            });
        }
        return acc;
    }, []);
    return sidebar;
}