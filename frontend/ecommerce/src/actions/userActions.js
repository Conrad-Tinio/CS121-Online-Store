import axios from "axios";
import { 
    USER_LOGIN_REQUEST, 
    USER_LOGIN_SUCCESS, 
    USER_LOGIN_FAIL, 
    USER_LOGOUT, 
    USER_REGISTER_REQUEST, 
    USER_REGISTER_SUCCESS, 
    USER_REGISTER_FAIL 
} from "../constants/userConstants";

export const register = (fname, lname, email, password) => async(dispatch) => {
    try {
        dispatch({
            type: USER_REGISTER_REQUEST
        })

        const config = {
            headers: {
                'Content-type': 'application/json'
            }
        }

        const { data } = await axios.post('/api/users/register/', 
            {
                'fname': fname, 
                'lname': lname, 
                'email': email, 
                'password': password
            }, config
        ) 

        dispatch({
            type: USER_REGISTER_SUCCESS,
            payload: data
        })

        if (data && data.details === "Please check your email to activate your account.") {
            localStorage.setItem('activateMessage', data.details)
        }
    } catch (error) {
        console.log('Registration error:', error.response);
        console.log('Error data:', error.response ? error.response.data : 'No response data');
        
        let errorMessage = 'An error occurred during registration';
        
        if (error.response && error.response.data) {
            if (error.response.data.details) {
                errorMessage = error.response.data.details;
            } else if (error.response.data.detail) {
                errorMessage = error.response.data.detail;
            }
        }
        
        dispatch({
            type: USER_REGISTER_FAIL,
            payload: errorMessage
        })
    }
}

export const login = (email, password) => async(dispatch) => {
    try {
        dispatch({
            type: USER_LOGIN_REQUEST
        })

        const config = {
            headers: {
                'Content-type': 'application/json'
            }
        }

        const { data } = await axios.post('/api/users/login/', 
            {
                username: email, 
                password: password
            }, config
        ) 

        dispatch({
            type: USER_LOGIN_SUCCESS,
            payload: data
        })

        localStorage.setItem('userInfo', JSON.stringify(data))
        
        // Set lastLoginTime to 0 to indicate a fresh login
        // This will trigger the welcome message in App.js
        localStorage.setItem('lastLoginTime', '0')
    } catch (error) {
        
        dispatch({
            type: USER_LOGIN_FAIL,
            payload: error.response && error.response.data.detail
            ? error.response.data.detail 
            : error.message, 
        })
    }
}

export const logout = () => (dispatch) => {
    localStorage.removeItem('userInfo')
    dispatch({type: USER_LOGOUT})
}