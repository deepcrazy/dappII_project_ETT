import React from "react";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import styles from "./Verification.module.scss";
function Verification() {
  //currently unused section for identity verification/profile
  return (
    <React.Fragment>
      <TextField
        id="outlined-basic"
        label="BirghtID"
        variant="outlined"
        className={styles.input}
      />
      <TextField
        id="outlined-basic"
        label="BloomID"
        variant="outlined"
        className={styles.input}
      />
      <TextField
        id="outlined-basic"
        label="Passport Scan"
        variant="outlined"
        className={styles.input}
      />
      <Button variant="contained" color="primary">
        Verify
      </Button>
    </React.Fragment>
  );
}

export default Verification;
