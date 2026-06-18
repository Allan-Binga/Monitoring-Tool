import axios from "axios";
import { endpoint } from "../api";

//Sart Container API
export const startContainer = (containerId) =>
    axios.post(`${endpoint}/docker/container/${containerId}/start`)

//Stop Container API
export const stopContainer = (containerId) =>
    axios.post(`${endpoint}/docker/container/${containerId}/stop`)

//Restart Container API
export const restartContainer = (containerId) =>
    axios.post(`${endpoint}/docker/container/${containerId}/restart`)
