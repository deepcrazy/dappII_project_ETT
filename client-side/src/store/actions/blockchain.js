import * as actionTypes from "./actionTypes";
import Web3 from "web3";
export const loginMetaMaskStart = () => {
  return {
    type: actionTypes.LOGIN_METAMASK_START
  };
};
export const loginMetaMaskFail = () => {
  return {
    type: actionTypes.LOGIN_METAMASK_FAIL
  };
};
export const loginMetaMaskSuccess = account => {
  return {
    type: actionTypes.LOGIN_METAMASK_SUCCESS,
    account: account
  };
};
export const refreshErrorState = account => {
  return {
    type: actionTypes.REFRESH_ERROR_STATE
  };
};
export const loginMetaMask = () => {
  return async dispatch => {
    dispatch(loginMetaMaskStart());
    const web3 = new Web3(window.ethereum);
    try {
      // Request account access if needed
      await window.ethereum.enable();
      // Acccounts now exposed
      const accounts = await web3.eth.getAccounts();
      dispatch(loginMetaMaskSuccess(accounts[0]));
    } catch (error) {
      dispatch(loginMetaMaskFail());
    }
  };
};
