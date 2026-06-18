import axios from "axios"
import { endpoint } from "../api"

//Start PM2 App
export const startApp = (name) => 
    axios.post(`${endpoint}/pm2/apps/${name}/start`)

//Stop PM2 App
export const stopApp = (name) => 
    axios.post(`${endpoint}/pm2/apps/${name}/stop`)

//Restart PM2 App
export const restartApp = (name) => 
    axios.post(`${endpoint}/pm2/apps/${name}/restart`)