import axios from "axios"
import { setAlert } from "./alerts"
import {
  REGISTER_FAIL,
  REGISTER_SUCCESS,
  USER_LOADED,
  AUTH_ERROR,
} from "./types"
import setAuthToken from "../util/setAuthToken"

export const loadUser = () => async (dispatch) => {
  if (localStorage.token) {
    setAuthToken(localStorage.token)
  }

  try {
    const res = await axios.get("/api/auth")
    dispatch({
      type: USER_LOADED,
      payload: res.data,
    })
  } catch (error) {
    dispatch({ type: AUTH_ERROR })
  }
}

export const register = ({ name, email, password }) => async (dispatch) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  }
  const body = JSON.stringify({ name, email, password })

  try {
    const res = await axios.post("/api/users", body, config)
    dispatch({
      type: REGISTER_SUCCESS,
      payload: res.data,
    })
  } catch (error) {
    const e = error.response.data.errors
    if (e) {
      e.forEach((err) => dispatch(setAlert(err.msg, "danger")))
    }
    dispatch({
      type: REGISTER_FAIL,
    })
  }
}
