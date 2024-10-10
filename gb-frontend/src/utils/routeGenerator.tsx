

export const routeGenerator = (items) => {
    const routes = items.reduce((acc, item) => {
        acc.push({
            path: item.path,
            element: item.element,
        })

        item.children.forEach(child => {
            acc.push({
                path: child.path,
                element: child.element,
            })

        });

    }, [])

    return routes;
}