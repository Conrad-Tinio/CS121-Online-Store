import {createStore,combineReducers,applyMiddleware} from 'redux';
import {thunk} from 'redux-thunk';
import { composeWithDevTools } from '@redux-devtools/extension';
import { productsListReducers, productDetailsReducers } from './reducers/productReducers';
import { userLoginReducer, userRegisterReducer } from './reducers/userReducers';
import { cartReducer } from './reducers/cartReducers';


const reducer = combineReducers({
    productsList:productsListReducers,
    productDetails: productDetailsReducers, 
    userLogin: userLoginReducer, 
    userRegister: userRegisterReducer,
    cart: cartReducer
})

const cartItemsFromStorage = localStorage.getItem('cartItems') ?
    JSON.parse(localStorage.getItem('cartItems')) : []

const initialState={
    cart:{cartItems:cartItemsFromStorage}
}
const middleware=[thunk]
const store = createStore(reducer,initialState,composeWithDevTools(applyMiddleware(...middleware)))

export default store;