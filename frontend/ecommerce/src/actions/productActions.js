import axios from "axios";
import {
  PRODUCT_LIST_REQUEST,
  PRODUCT_LIST_SUCCESS,
  PRODUCT_LIST_FAIL,
  PRODUCT_DETAILS_REQUEST, 
  PRODUCT_DETAILS_SUCCESS, 
  PRODUCT_DETAILS_FAIL
} from "../constants/productConstants";

export const listProducts = (keyword = '', category = '', arrival = '') => async (dispatch) => {
  try {
    dispatch({ type: PRODUCT_LIST_REQUEST });

    // Build the URL with correct query parameters
    const params = new URLSearchParams();
    if (keyword) params.append('keyword', keyword);
    if (category) params.append('category', category);
    if (arrival) params.append('arrival', arrival);
    
    const queryString = params.toString();
    const url = `/api/products/${queryString ? `?${queryString}` : ''}`;
    
    console.log('\nProduct Action - Making API request:');
    console.log('Parameters received:', { keyword, category, arrival });
    console.log('URL being called:', url);
    
    const { data } = await axios.get(url);
    
    console.log('\nProduct Action - Received API response:');
    console.log('Total products:', data.length);
    data.forEach(product => {
      console.log(`- ${product.productName}: arrival_status='${product.arrival_status}'`);
    });
    
    dispatch({
      type: PRODUCT_LIST_SUCCESS,
      payload: data,
    });
  } catch (error) {
    console.error('Error in listProducts action:', error);
    dispatch({
      type: PRODUCT_LIST_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

export const listProductDetails = (id) => async (dispatch) => {
  try {
    dispatch({ type: PRODUCT_DETAILS_REQUEST });
    const { data } = await axios.get(`/api/product/${id}`);

    dispatch({
      type: PRODUCT_DETAILS_SUCCESS,
      payload: data,
    });
    
  } catch (error) {
    dispatch({
      type: PRODUCT_DETAILS_FAIL,
      payload:
        error.response && error.response.data.detail
          ? error.response.data.detail
          : error.message,
    });
  }
};
