import { ReactNode } from "react";

export type TRoutePaths = {
    name: string;
    path: string;
    element: ReactNode;
}

export type TRoute = {
    key: string;
    label: ReactNode;
    children?: TRoute[];
}