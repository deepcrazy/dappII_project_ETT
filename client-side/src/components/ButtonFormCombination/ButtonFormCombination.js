import React from "react";
import { Button, Box, TextField } from "@material-ui/core";
import styles from "./ButtonFormCombination.module.scss";
import ArrowForwardIosIcon from "@material-ui/icons/ArrowForwardIos";

export const ButtonFormCombination = ({
  submitClick,
  label,
  children,
  inputType = "number",
  ...props
}) => {
  const [openForm, setOpenForm] = React.useState(false);
  const [value, setValue] = React.useState("");
  const [inputDisabled, setInputDisabled] = React.useState(false);

  const inputValidation = event => {
    setValue(event.target.value);
  };

  const submitHandler = () => {
    setInputDisabled(true);

    //function to be called on submit
    submitClick(value)
      .then(res => {
        console.log("transaction completed");
        setOpenForm(false);
        setValue("");
        setInputDisabled(false);
      })
      .catch(err => {
        console.log(err);
        setInputDisabled(false);
      });
  };

  return (
    <Box
      width={250}
      height={50}
      display="flex"
      flexDirection="row"
      alignItems="center"
      justifyContent="center"
    >
      {!openForm && (
        <Button
          className={styles.buttonText}
          onClick={() => setOpenForm(true)}
          {...props}
        >
          {children}
        </Button>
      )}
      {openForm && (
        <React.Fragment>
          <TextField
            label={label}
            type={inputType}
            value={value}
            onChange={inputValidation}
            disabled={inputDisabled}
          />
          <Button onClick={submitHandler} disabled={!value}>
            <ArrowForwardIosIcon />
          </Button>
        </React.Fragment>
      )}
    </Box>
  );
};

export default ButtonFormCombination;
