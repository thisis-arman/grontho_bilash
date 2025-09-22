

interface RouteItem {
    path: string;
    element: JSX.Element;
    children?: RouteItem[];
}

interface RouteGenerator {
    (items: RouteItem[]): RouteItem[];
}

export const routeGenerator: RouteGenerator = (items) => {
    console.log(items);

    const routes = items.reduce((acc: RouteItem[], item: RouteItem) => {
        if (item.path && item.element) {
            acc.push({
                path: item.path,
                element: item.element,
            });
        }

        if (item.children) {
            item.children.forEach((child) => {
                acc.push({
                    path: child.path!,
                    element: child.element,
                });
            });
        }
        return acc;
    }, []);

    return routes;
}