import * as actionTypes from "../actions/actionTypes";
import { updateObject } from "../../scripts/utility";
const initialState = {
  account: "",
  loading: false,
  error: ""
};
const loginMetaMaskStart = (state, action) => {
  return updateObject(state, { loading: true, error: "" });
};
const loginMetaMaskFail = (state, action) => {
  return updateObject(state, {
    loading: false,
    error: "Unable to connect MetaMask"
  });
};
const refreshError = (state, action) => {
  return updateObject(state, {
    error: ""
  });
};
const loginMetaMaskSuccess = (state, action) => {
  return updateObject(state, {
    loading: false,
    account: action.account,
    error: ""
  });
};
export default (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.LOGIN_METAMASK_START:
      return loginMetaMaskStart(state, action);
    case actionTypes.LOGIN_METAMASK_SUCCESS:
      return loginMetaMaskSuccess(state, action);
    case actionTypes.LOGIN_METAMASK_FAIL:
      return loginMetaMaskFail(state, action);
    case actionTypes.REFRESH_ERROR_STATE:
      return refreshError(state, action);
    default:
      return state;
  }
};
