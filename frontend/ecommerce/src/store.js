import {createStore,combineReducers,applyMiddleware} from 'redux';
import thunk from 'redux-thunk';
import { composeWithDevTools } from '@redux-devtools/extension';
import { productsListReducers, productDetailsReducers } from './reducers/productReducers';
import { userLoginReducer, userRegisterReducer } from './reducers/userReducers';
import { cartReducer } from './reducers/cartReducers';
import { checkoutReducer } from './reducers/checkoutReducer';
import { wishlistReducer } from './reducers/wishlistReducers';
import { orderListMyReducer } from './reducers/orderReducers';


const reducer = combineReducers({
    productsList:productsListReducers,
    productDetails: productDetailsReducers, 
    userLogin: userLoginReducer, 
    userRegister: userRegisterReducer,
    cart: cartReducer,
    checkout: checkoutReducer,
    wishlist: wishlistReducer,
    orderListMy: orderListMyReducer,
})

const cartItemsFromStorage = localStorage.getItem('cartItems') ?
    JSON.parse(localStorage.getItem('cartItems')) : []

const userInfoFromStorage = localStorage.getItem('userInfo') ?
    JSON.parse(localStorage.getItem('userInfo')) : null

const shippingAddressFromStorage = localStorage.getItem('shippingAddress') ?
    JSON.parse(localStorage.getItem('shippingAddress')) : {}

const paymentMethodFromStorage = localStorage.getItem('paymentMethod') ?
    JSON.parse(localStorage.getItem('paymentMethod')) : ''

const initialState = {
    productsList: { products: [] },
    cart: { cartItems: cartItemsFromStorage },
    userLogin: { userInfo: userInfoFromStorage },
    checkout: {
        shippingAddress: shippingAddressFromStorage,
        paymentMethod: paymentMethodFromStorage
    }
}

const middleware=[thunk]
const store = createStore(reducer,initialState,composeWithDevTools(applyMiddleware(...middleware)))

export default store;