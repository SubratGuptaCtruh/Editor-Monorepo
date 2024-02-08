import React, { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import LoadingText from "../2D/Components/LoadingText/LoadingText";
import App from "../App";
import Publish from "../Publish/Publish";

// Define types for route configuration
type RouteConfig<TProps> = {
    path: string;
    component: React.ComponentType<TProps>;
};

const routesConfig: RouteConfig<Record<string, never>>[] = [
    // { path: "/id/:id/uid/:uid/t/:tourId", component: App },
    { path: "/", component: App },
    { path: "/publish", component: Publish },
    { path: "/integrations", component: lazy(() => import("../2D/Pages/Integrations/Integrations")) },
    { path: "/404", component: lazy(() => import("../2D/Pages/NotFound/NotFound")) },
    { path: "*", component: lazy(() => import("../2D/Pages/NotFound/NotFound")) },
];

const Fallback = () => <LoadingText />; // Define a fallback UI for Suspense.

const generateRoutes = () => {
    return routesConfig.map((route, index) => <Route key={index} path={route.path} element={<route.component />} />);
};

const AppRoutes: React.FC = () => (
    <Suspense fallback={<Fallback />}>
        <Routes>{generateRoutes()}</Routes>
    </Suspense>
);

export default AppRoutes;
