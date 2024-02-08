import { Provider } from "jotai";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import AllRoutes from "./AllRoutes/AllRoutes";

export const createUI = () => {
    if ("serviceWorker" in navigator) {
        const url = import.meta.env.MODE === "production" ? "/service-worker.js" : "/dev-sw.js?dev-sw";
        navigator.serviceWorker.register(url, { type: "module" }).then((registration) => {
            registration.update();
        });
    }

    return ReactDOM.createRoot(document.getElementById("root")!).render(
        <Provider>
            <BrowserRouter>
                <AllRoutes />
            </BrowserRouter>
        </Provider>
    );
};
