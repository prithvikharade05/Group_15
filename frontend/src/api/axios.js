import axios from "axios";

    baseURL: "/api", 

// Attach token automatically
API.interceptors.request.use((req) => {
    const token = localStorage.getItem("token");

    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
    }

    return req;
});

// Handle 401 Unauthorized errors globally
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            console.warn("Unauthorized access - clearing token and redirecting to login.");
            localStorage.removeItem("token");

            if (window.location.pathname !== "/login" && window.location.pathname !== "/") {
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);

export default API;