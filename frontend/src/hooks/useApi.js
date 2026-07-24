import { useState } from "react";

export const useApi = (apiFunc) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const request = async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFunc(...args);
      setData(result);
      return result;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Something went wrong";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { data, error, loading, request };
};
