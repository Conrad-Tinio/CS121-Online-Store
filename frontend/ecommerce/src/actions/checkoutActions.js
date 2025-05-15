import axios from 'axios'
import {
    CHECKOUT_SAVE_SHIPPING_ADDRESS,
    CHECKOUT_SAVE_PAYMENT_METHOD,
    CHECKOUT_CREATE_REQUEST,
    CHECKOUT_CREATE_SUCCESS,
    CHECKOUT_CREATE_FAIL,
    CHECKOUT_CLEAR
} from '../constants/checkoutConstants'
import { CART_CLEAR_ITEMS } from '../constants/cartConstants'

export const saveShippingAddress = (data) => (dispatch) => {
    dispatch({
        type: CHECKOUT_SAVE_SHIPPING_ADDRESS,
        payload: data
    })

    localStorage.setItem('shippingAddress', JSON.stringify(data))
}

export const savePaymentMethod = (data) => (dispatch) => {
    dispatch({
        type: CHECKOUT_SAVE_PAYMENT_METHOD,
        payload: data
    })

    localStorage.setItem('paymentMethod', JSON.stringify(data))
}

export const createOrder = (order) => async (dispatch, getState) => {
    try {
        dispatch({
            type: CHECKOUT_CREATE_REQUEST
        })

        const {
            userLogin: { userInfo },
        } = getState()

        const config = {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${userInfo.token}`
            }
        }

        const { data } = await axios.post(
            '/api/orders/create/',
            order,
            config
        )

        dispatch({
            type: CHECKOUT_CREATE_SUCCESS,
            payload: data
        })

        dispatch({
            type: CART_CLEAR_ITEMS
        })

        localStorage.removeItem('cartItems')

    } catch (error) {
        dispatch({
            type: CHECKOUT_CREATE_FAIL,
            payload: error.response && error.response.data.detail
                ? error.response.data.detail
                : error.message,
        })
    }
}

export const clearCheckout = () => (dispatch) => {
    dispatch({ type: CHECKOUT_CLEAR })
    localStorage.removeItem('shippingAddress')
    localStorage.removeItem('paymentMethod')
} 