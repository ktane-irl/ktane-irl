import axios, { AxiosInstance } from "axios"

const apiClient: AxiosInstance = axios.create({
    // baseURL: "http://localhost:8080",
    headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache",
        "Expires": "0",
    },
})

export default apiClient
