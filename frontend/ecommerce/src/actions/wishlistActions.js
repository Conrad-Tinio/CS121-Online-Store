import axios from 'axios'
import {
    WISHLIST_ADD_REQUEST,
    WISHLIST_ADD_SUCCESS,
    WISHLIST_ADD_FAIL,
    WISHLIST_REMOVE_REQUEST,
    WISHLIST_REMOVE_SUCCESS,
    WISHLIST_REMOVE_FAIL,
    WISHLIST_LIST_REQUEST,
    WISHLIST_LIST_SUCCESS,
    WISHLIST_LIST_FAIL,
} from '../constants/wishlistConstants'

export const addToWishlist = (productId) => async (dispatch, getState) => {
    try {
        dispatch({ type: WISHLIST_ADD_REQUEST })

        const {
            userLogin: { userInfo },
        } = getState()

        const config = {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${userInfo.token}`,
            },
        }

        const { data } = await axios.post(
            `/api/wishlist/${productId}/`,
            {},
            config
        )

        dispatch({
            type: WISHLIST_ADD_SUCCESS,
            payload: data,
        })

    } catch (error) {
        dispatch({
            type: WISHLIST_ADD_FAIL,
            payload: error.response && error.response.data.detail
                ? error.response.data.detail
                : error.message,
        })
    }
}

export const removeFromWishlist = (productId) => async (dispatch, getState) => {
    try {
        dispatch({ type: WISHLIST_REMOVE_REQUEST })

        const {
            userLogin: { userInfo },
        } = getState()

        const config = {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${userInfo.token}`,
            },
        }

        await axios.delete(
            `/api/wishlist/${productId}/`,
            { headers: config.headers }
        )

        dispatch({
            type: WISHLIST_REMOVE_SUCCESS,
            payload: productId,
        })

    } catch (error) {
        dispatch({
            type: WISHLIST_REMOVE_FAIL,
            payload: error.response && error.response.data.detail
                ? error.response.data.detail
                : error.message,
        })
    }
}

export const listWishlist = () => async (dispatch, getState) => {
    try {
        dispatch({ type: WISHLIST_LIST_REQUEST })

        const {
            userLogin: { userInfo },
        } = getState()

        const config = {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${userInfo.token}`,
            },
        }

        const { data } = await axios.get(
            `/api/wishlist/`,
            config
        )

        dispatch({
            type: WISHLIST_LIST_SUCCESS,
            payload: data,
        })

    } catch (error) {
        dispatch({
            type: WISHLIST_LIST_FAIL,
            payload: error.response && error.response.data.detail
                ? error.response.data.detail
                : error.message,
        })
    }
} 