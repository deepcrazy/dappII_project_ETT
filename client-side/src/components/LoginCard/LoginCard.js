import React from "react";
import styles from "./LoginCard.module.scss";
import {
  Card,
  CardContent,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from "@material-ui/core";

export const LoginCard = ({ type, header, children, state, userType }) => {
  //default button and click handling for creating a new metamask
  let buttonText = "Create a Metamask account";
  let buttonClick = () => window.open("https://metamask.io");

  //is using username and password
  if (type === "username") {
    buttonClick = () => {
      state.setRegister(!state.register);
    };

    if (!state.register) {
      buttonText = "Register as a new user";
    } else {
      buttonText = "Go back";
    }
  }

  return (
    <Card className={styles["card__main"]} elevation={2}>
      <Typography variant="h5">{header}</Typography>
      <FormControl
        variant="outlined"
        size="medium"
        className={styles["card__dropdown"]}
        >
          <InputLabel>Sign in as:</InputLabel>
          <Select labelWidth={75} value={userType.type} onChange={event => userType.setType(event.target.value)}>
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            <MenuItem value={"user"}>User</MenuItem>
            {/* <MenuItem value={"shareholder"}>Shareholder</MenuItem> */}
            <MenuItem value={"admin"}>Event Organiser</MenuItem>
          </Select>
        </FormControl>
      <CardContent className={styles["card__content"]}>
        {children}
      </CardContent>
      <Button onClick={buttonClick}>
        <Typography variant="caption">{buttonText}</Typography>
      </Button>
    </Card>
  );
};

export default LoginCard;
