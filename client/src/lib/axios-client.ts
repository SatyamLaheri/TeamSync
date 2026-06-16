import { CustomError } from "@/types/custom-error.type";
import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Debug: Log the baseURL to see if it's being loaded correctly
console.log('API Base URL:', baseURL);
console.log('Environment variable:', import.meta.env.VITE_API_BASE_URL);

const options = {
  baseURL,
  withCredentials: true,
  timeout: 10000,
};

const API = axios.create(options);

// Request interceptor to log requests and add JWT token
API.interceptors.request.use(
  (config) => {
    // Add JWT token to requests
    const token = localStorage.getItem('authToken');
    console.log("Stored token:", token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("Authorization header set:", `Bearer ${token}`);
    } else {
      console.log("No token found in localStorage");
    }
    
    console.log("API Request:", {
      url: config.url,
      method: config.method,
      baseURL: config.baseURL,
      withCredentials: config.withCredentials,
      headers: config.headers,
      token: token ? "present" : "missing"
    });
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Flag to prevent infinite redirects
let isRedirecting = false;

API.interceptors.response.use(
  (response) => {
    console.log("API Response:", {
      url: response.config.url,
      status: response.status,
      headers: response.headers
    });
    
    // Store JWT token on login response
    console.log("Response data:", response.data);
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
      console.log("JWT token stored in localStorage:", response.data.token);
      // Reset redirect flag when token is stored
      isRedirecting = false;
    } else {
      console.log("No token found in response data");
    }
    
    return response;
  },
  async (error) => {
    // Handle cases where error.response is undefined
    const status = error.response?.status;
    const data = error.response?.data;

    console.log("API Error:", {
      status,
      data,
      url: error.config?.url,
      method: error.config?.method,
      baseURL: error.config?.baseURL,
      withCredentials: error.config?.withCredentials,
      message: error.message
    });

    if (status === 401 && !isRedirecting) {
      console.log("Unauthorized - clearing token and redirecting to login");
      isRedirecting = true;
      // Clear token on 401 errors
      localStorage.removeItem('authToken');
      // Redirect to login page
      window.location.href = '/sign-in';
    }

    const customError: CustomError = {
      ...error,
      errorCode: data?.errorCode || "UNKNOWN_ERROR",
    };

    return Promise.reject(customError);
  }
);

export default API;
