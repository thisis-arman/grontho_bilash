
import React from "react";
import { NavLink } from "react-router-dom";

interface SidebarItem {
    key: string;
    label: JSX.Element | string;
    icon?:React.ReactNode;
    children?: SidebarItem[];
}

interface Item {
    path?: string;
    name: string;
    icon?:React.ReactNode;
    children?: Item[];
}

export const sidebarGenerator = (items: Item[], role: string): SidebarItem[] => {
    console.log({ items });
    const sidebar = items.reduce<SidebarItem[]>((acc, item) => {
        console.log(acc, item);
        if (item.path && item.name) {
            acc.push({
                key: item.name,
                icon:item.icon,
                label: <NavLink to={`/${role}/${item.path}`}>{item.name}</NavLink>,
            });
        }

        if (item.children) {
            acc.push({
                key: item.name,
                label: item.name,
                icon: item.icon,
                children: item.children.map((child) => ({
                    key: child.name,
                    icon:item.icon,
                    label: <NavLink to={`/${role}/${child.path}`}>{child.name}</NavLink>,
                })),
            });
        }
        return acc;
    }, []);
    return sidebar;
}