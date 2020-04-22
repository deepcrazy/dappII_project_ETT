import React from "react";
import { AppBar, Toolbar, Box, Typography, Button } from "@material-ui/core";
// import logo from "../../assets/images/logo.png";
import styles from "./NavigationBar.module.scss";
// import { useHistory } from "react-router-dom";
import { useDispatch } from "react-redux";
import * as actions from "../../store/actions/index";

export const NavigationBar = ({ label }) => {
  const imgHeight = 50; //image height for logo
  // let history = useHistory();
  const dispatch = useDispatch();

  const logout = () => {
    // window.location.reload() //force refresh to logout

    dispatch(actions.loginMetaMaskSuccess("")); //clearing the stored account
    // history.push('/login')
  }
  return (
    <AppBar color="default" position="sticky">
      <Toolbar>
        <Box maxHeight={`${imgHeight}px`} pr={2}>
          {/* <img src={logo} alt="credefi-logo" height={imgHeight} /> */}
          <Typography variant="h5">EventChain</Typography>
        </Box>
        <Box
          width="100%"
          display="flex"
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h6">{label}</Typography>
        </Box>
        {label !== "" && (
          <Button
            className={styles.button}
            onClick={logout}
          >
            Logout
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default NavigationBar;
