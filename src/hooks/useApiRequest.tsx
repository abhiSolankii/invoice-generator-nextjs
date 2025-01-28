import axios from "../config/axiosConfig";
import { useState } from "react";

/**
 * Generic loader function to make API requests.
 *
 * @param method - The HTTP method (GET, POST, PUT, DELETE, etc.)
 * @param path - The API path (endpoint) to send the request to.
 * @param data - The data to be sent (for POST/PUT requests).
 *
 * @returns A promise resolving to the response data or error.
 */

const useApiRequest = () => {
  const [loading, setLoading] = useState<boolean>(false);

  const apiRequest = async <T,>(
    method: string,
    path: string,
    data?: any
  ): Promise<T> => {
    try {
      setLoading(true); // Start loading when the request starts
      const response = await axios({
        method: method,
        url: path,
        data: method === "POST" || method === "PUT" ? data : undefined, // Pass data for POST/PUT
        withCredentials: true,
      });

      setLoading(false); // Stop loading after the request finishes
      return response.data as T; // Return the response data
    } catch (error) {
      setLoading(false); // Stop loading in case of an error
      console.error(`Error during ${method} request to ${path}:`, error);
      throw error;
    }
  };

  return { apiRequest, loading };
};

export default useApiRequest;
