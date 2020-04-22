import React from "react";
import { Button, Typography, Box } from "@material-ui/core";
import styles from "./UserDashHeading.module.scss";
import logo from "../../assets/images/logo.png";
import moment from "moment";

export const UserDashHeading = props => {
  const [errorMsg, setErrorMsg] = React.useState(" ");
  //placeholders that are set based on status (below)
  let helpText = "";
  let buttonDisabled = false;
  let buttonText = "";
  let action = () => {};

  // console.log(props);

  switch (props.status) {
    case 1:
      //loan requested
      buttonDisabled = true;
      buttonText = "Waiting for Approval";
      helpText = "Please be patient while we approve your loan";
      break;
    case 2:
      //loan approved
      buttonText = "Accept Loan Terms";
      action = props.accept;
      helpText =
        "Please choose to accept the approved loan details, or reject them below";
      break;
    case 3:
      //loan not approved
      buttonDisabled = true;
      buttonText = "Loan Request Not Approved";
      helpText = "We are sorry, but we could not approve your loan";
      break;
    case 4:
      //loan accepted
      buttonDisabled = true;
      buttonText = "Waiting for Funding";
      helpText = "Please be patient while we fund your loan";
      break;
    case 5:
      //loan not accepted
      buttonDisabled = true;
      buttonText = "Loan Terms Not accepted";
      helpText = "We are sorry you did not accept the loan terms";
      break;
    case 7:
      //loan not funded
      buttonDisabled = true;
      buttonText = "Loan Not Funded";
      helpText = "We are sorry, but we could not fund your loan";
      break;
    default:
      //case 6 + all else (funded + active)
      const currentIndex = props.loanPayments.statuses.findIndex(
        val => val === "0"
      );
      buttonText = "Make Payment";
      action = props.pay;
      buttonDisabled = currentIndex === -1;
      helpText =
        currentIndex === -1
          ? "All payments have been made. Thank you for using credefi!"
          : `Your next payment of ${
              props.loanPayments.monthlyPayment
            } DAI is due on ${moment
              .unix(props.loanPayments.dueDates[currentIndex])
              .format("D MMM YYYY")}`;
  }

  //click handler based on parameters set in the switch
  const onClick = () => {
    try {
      action();
      setErrorMsg(" ");
    } catch (e) {
      setErrorMsg(props.status === 2 ? "Accept Failed" : "Payment Failed");
    }
  };

  //components rendered depending on state
  return (
    <React.Fragment>
      {props.status > 0 && (
        <React.Fragment>
          <Button
            className={styles["submitButton"]}
            disabled={buttonDisabled}
            onClick={onClick}
            style={{ fontSize: "25pt" }}
            color="primary"
            variant="outlined"
          >
            {buttonText}
          </Button>
          <Box my={1}>
            <Typography variant="caption" color="secondary">
              {errorMsg}
            </Typography>
          </Box>
          <Box my={1}>
            <Typography variant="body2">{helpText}</Typography>
          </Box>
        </React.Fragment>
      )}
      {props.status === 0 && (
        <React.Fragment>
          <Typography variant="overline">welcome to</Typography>
          <Box maxWidth={"25rem"}>
            <img src={logo} alt="logo-heading" width={"100%"} />
          </Box>
          <Typography variant="overline">
            please request a loan below to get started
          </Typography>
        </React.Fragment>
      )}
    </React.Fragment>
  );
};
