import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/', // Updated for vulnerability dashboard backend
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to attach the token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle token refreshes if needed, or global errors
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        let errorMessage = "An unexpected error occurred.";

        if (error.response) {
            // Check if the backend sent a generic error string
            if (error.response.data && error.response.data.error) {
                errorMessage = error.response.data.error;
            }
            // Check if the backend sent field-specific validation errors
            else if (error.response.data && typeof error.response.data === 'object') {
                // If it's a validation error object like {"email": ["Error..."], "password": ["Error..."]}
                // Take the first error message from the first field to show to the user
                const firstKey = Object.keys(error.response.data)[0];
                const firstError = error.response.data[firstKey];

                if (Array.isArray(firstError) && firstError.length > 0) {
                    errorMessage = typeof firstError[0] === 'string' ? firstError[0] : JSON.stringify(firstError[0]);
                } else if (typeof firstError === 'string') {
                    errorMessage = firstError;
                }
            }
        } else if (error.request) {
            errorMessage = "Network error. Please check your connection.";
        } else {
            errorMessage = error.message;
        }

        // Return a standardized Error object so all components can just use err.message
        return Promise.reject(new Error(errorMessage));
    }
);

export default api;
