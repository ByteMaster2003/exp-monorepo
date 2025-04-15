import axios from "axios";

export const POST = async (path, payload, headers = { "Content-Type": "application/json" }) => {
  return axios
    .post(path, payload, { withCredentials: true, headers })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      return error.response?.data;
    });
};

export const GET = async (path, headers = { "Content-Type": "application/json" }) => {
  return axios
    .get(path, { withCredentials: true, headers })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      return error.response?.data;
    });
};
