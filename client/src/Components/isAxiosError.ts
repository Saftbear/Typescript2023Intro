import axios, { AxiosError } from "axios";

export function isAxiosError(error: any): error is AxiosError {
    return axios.isAxiosError(error);
  }
  