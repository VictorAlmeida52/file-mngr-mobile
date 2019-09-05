import axios from 'axios';

const api = axios.create({
  baseURL: 'https://file-mngr.herokuapp.com',
});

export default api;
