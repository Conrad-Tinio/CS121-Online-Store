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

export const wishlistReducer = (state = { wishlistItems: [] }, action) => {
    switch (action.type) {
        case WISHLIST_LIST_REQUEST:
            return { loading: true, wishlistItems: [] }

        case WISHLIST_LIST_SUCCESS:
            return { loading: false, wishlistItems: action.payload }

        case WISHLIST_LIST_FAIL:
            return { loading: false, error: action.payload }

        case WISHLIST_ADD_REQUEST:
            return { ...state, loading: true }

        case WISHLIST_ADD_SUCCESS:
            return {
                loading: false,
                wishlistItems: [...state.wishlistItems, action.payload]
            }

        case WISHLIST_ADD_FAIL:
            return { ...state, loading: false, error: action.payload }

        case WISHLIST_REMOVE_REQUEST:
            return { ...state, loading: true }

        case WISHLIST_REMOVE_SUCCESS:
            return {
                loading: false,
                wishlistItems: state.wishlistItems.filter(x => x.product._id !== action.payload)
            }

        case WISHLIST_REMOVE_FAIL:
            return { ...state, loading: false, error: action.payload }

        default:
            return state
    }
} 