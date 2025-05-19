import { Outlet, createRoute, createRootRoute, createRouter } from '@tanstack/react-router'
import Home from '@/pages/home'
import About from '@/pages/about'
import Error404 from '@/pages/error/404'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { PageLayout } from '@/pages/layout.tsx'

const rootRoute = createRootRoute({
    component: () => (
        <>
            <PageLayout>
                <Outlet />
            </PageLayout>
            <TanStackRouterDevtools />
        </>
    ),
    notFoundComponent: Error404,
})

const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: Home,
})

const stockRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/about',
    component: About,
})

const routeTree = rootRoute.addChildren([indexRoute, stockRoute])
export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router
    }
}
