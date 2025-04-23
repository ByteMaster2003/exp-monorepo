import axios from "axios";

export const POST = async (uri, payload, headers = { "Content-Type": "application/json" }) => {
  return axios
    .post(uri, payload, { withCredentials: true, headers })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      return error.response?.data;
    });
};

export const GET = async (uri, headers = { "Content-Type": "application/json" }) => {
  return axios
    .get(uri, { withCredentials: true, headers })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      return error.response?.data;
    });
};
