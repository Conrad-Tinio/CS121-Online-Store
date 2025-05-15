import {
    CHECKOUT_SAVE_SHIPPING_ADDRESS,
    CHECKOUT_SAVE_PAYMENT_METHOD,
    CHECKOUT_CREATE_REQUEST,
    CHECKOUT_CREATE_SUCCESS,
    CHECKOUT_CREATE_FAIL,
    CHECKOUT_CLEAR
} from '../constants/checkoutConstants'

export const checkoutReducer = (state = { shippingAddress: {}, paymentMethod: '' }, action) => {
    switch (action.type) {
        case CHECKOUT_SAVE_SHIPPING_ADDRESS:
            return {
                ...state,
                shippingAddress: action.payload
            }

        case CHECKOUT_SAVE_PAYMENT_METHOD:
            return {
                ...state,
                paymentMethod: action.payload
            }

        case CHECKOUT_CREATE_REQUEST:
            return {
                ...state,
                loading: true
            }

        case CHECKOUT_CREATE_SUCCESS:
            return {
                ...state,
                loading: false,
                success: true,
                order: action.payload
            }

        case CHECKOUT_CREATE_FAIL:
            return {
                ...state,
                loading: false,
                error: action.payload
            }

        case CHECKOUT_CLEAR:
            return {
                shippingAddress: {},
                paymentMethod: ''
            }

        default:
            return state
    }
} 