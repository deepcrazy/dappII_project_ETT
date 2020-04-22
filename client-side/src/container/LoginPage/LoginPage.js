import React from "react";
import styles from "./LoginPage.module.scss";
import { Box, Button, TextField } from "@material-ui/core";
import { LoginCard } from "../../components/LoginCard/LoginCard";
import { MetamaskButton } from "../../components/MetamaskButton/MetamaskButton";
import { useDispatch, useSelector } from "react-redux";
import Backdrop from "@material-ui/core/Backdrop";
import CircularProgress from "@material-ui/core/CircularProgress";
import * as actions from "../../store/actions/index";
import Snackbar from "@material-ui/core/Snackbar";
import MuiAlert from "@material-ui/lab/Alert";
export const LoginPage = ({userType}) => {
  const [register, setRegister] = React.useState(false); //state for creating a new user
  const errors = useSelector(state => {
    return state.error;
  });
  const loading = useSelector(state => {
    return state.loading;
  });
  const dispatch = useDispatch();
  const newUser = { register, setRegister };
  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    dispatch(actions.refreshErrorState());
  };

  // login with metamask button handler
  const metamaskLogin = () => {
    try {
      console.log("ENtering metamask..!!")
      dispatch(actions.loginMetaMask());
    } catch (error) {
      console.log(error);
    }
  };

  //alert component if error is present
  function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
  }
  return (
    <React.Fragment>
      <Backdrop open={loading} className={styles.backdrop}>
        <CircularProgress color="secondary" />
      </Backdrop>
      <Snackbar open={!!errors} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity="error">
          {errors}
        </Alert>
      </Snackbar>
      <Box
        display="flex"
        flexDirection="row"
        justifyContent="center"
        alignItems="center"
        px={2}
        py={10}
      >
        <LoginCard header="Metamask" type="metamask" userType={userType}>
          <MetamaskButton onClick={metamaskLogin} disabled={userType.type === ""}/>
        </LoginCard>
        {/* currently not displaying login card for user - no functionality */}
        {false && (
          <LoginCard
            header="Username & Password"
            type="username"
            state={newUser}
            userType={userType}
          >
            <TextField
              variant="outlined"
              label="Username"
              className={styles.input}
            />
            <TextField
              variant="outlined"
              label="Password"
              className={styles.input}
              type="password"
            />
            {register && (
              <TextField
                variant="outlined"
                label="Password (again)"
                type="password"
                className={styles.input}
              />
            )}
            <Button>{register ? "Register" : "Log In"}</Button>
          </LoginCard>
        )}
      </Box>
    </React.Fragment>
  );
};

export default LoginPage;
