import axios from 'axios';

export const api = axios.create({
    // baseURL: 'https://auth.expo.io/@jsnprogrammer77/nlwcopamobile2'
    baseURL: 'http://192.168.0.39:8081'
})