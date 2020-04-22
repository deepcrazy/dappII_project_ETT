import React from "react";
import { Button, Typography } from "@material-ui/core";
import metamaskLogo from "../../assets/images/metamask-fox.svg";
import styles from "./MetamaskButton.module.scss";

export const MetamaskButton = ({ ...props }) => {
  const [hover, setHover] = React.useState(false);
  return (
    <div className={styles["metamask__div"]}>
      <Button
        {...props}
        className={styles["metamask__button"]}
        onMouseEnter={() => {
          setHover(true);
        }}
        onMouseLeave={() => {
          setHover(false);
        }}
      >
        <Typography variant="button" className={styles["metamask__text"]}>
          Sign In with Metamask
        </Typography>
        <img
          src={metamaskLogo}
          alt="metamask-logo"
          className={styles["metamask__logo"]}
          style={{
            opacity: hover ? 0.5 : 1,
            filter: props.disabled ? "grayscale(0.5)" : ""
          }}
        />
      </Button>
      {false && (
        <img
          src={metamaskLogo}
          alt="metamask-logo"
          className={styles["metamask__logo"]}
        />
      )}
    </div>
  );
};

export default MetamaskButton;
