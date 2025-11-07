import axios from 'axios';

// Creamos una instancia base de Axios
const api = axios.create({
    baseURL: 'http://127.0.0.1:5000/api', 
});


api.interceptors.request.use(
    (config) => {
        // Obtenemos el token de localStorage
        const token = localStorage.getItem('token');
        console.log("Token añadido a la petición:", token);
        
        // Si el token existe, lo añadimos a la cabecera 'Authorization'
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
