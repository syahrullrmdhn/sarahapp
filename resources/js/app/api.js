import axios from 'axios';

export const api = axios.create({
    baseURL: '/api',
    headers: {
        Accept: 'application/json',
    },
});

export function setAuthToken(token) {
    if (token) {
        api.defaults.headers.common.Authorization = `Bearer ${token}`;
    }
}

export function clearAuthToken() {
    delete api.defaults.headers.common.Authorization;
}

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            window.dispatchEvent(new Event('auth:unauthorized'));
        }
        return Promise.reject(error);
    }
);
