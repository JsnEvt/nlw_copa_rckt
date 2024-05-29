import axios from 'axios';

export const api = axios.create({
    // baseURL: 'http://192.168.0.39:8081'
    baseURL: 'https://auth.expo.io/@jsnprogrammer77/nlwcopamobile'
    // baseURL:'http://vmi814957.contaboserver.net:3333'
    // baseURL:'http://192.168.100.93:3333'
})