import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
  timeout: 30000,
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('token');
  if (token) {
    (config.headers as any) = {
      ...(config.headers || {}),
      Authorization: `Bearer ${token}`,
    };
  }
  // If sending FormData, let Axios set the multipart boundary by removing any preset Content-Type
  const isFormData = typeof FormData !== 'undefined' && config.data instanceof FormData;
  if (isFormData && config.headers) {
    delete (config.headers as any)['Content-Type'];
  }
  return config;
});

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    const status = error.response?.status;
    if (status === 401) {
      // TEMP: only log 401s for debugging, do not auto-logout or redirect to login
      console.warn('Received 401 response from API', {
        url: (error.config as any)?.url,
        method: (error.config as any)?.method,
      });
    } else if (status === 403) {
      console.error('Access forbidden');
    } else if (status !== undefined && status >= 500) {
      console.error('Server error. Please try again later.');
    }
    return Promise.reject(error);
  }
);

export const setAuthToken = (token: string) => {
  localStorage.setItem('token', token);
};

export const removeAuthToken = () => {
  localStorage.removeItem('token');
};

export default api;
