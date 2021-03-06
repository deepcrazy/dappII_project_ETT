import React, { useEffect } from "react";
import {
  // Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  CardHeader,
  InputAdornment,
} from "@material-ui/core";
import { NumberFormatCustom } from "../../utils";
import {
  createEvent,
  // getMaximumSeats
} from "../../scripts/eventTicketingTokenInteract";
import eventTicketingTokenInfo from "../../scripts/eventTicketingTokenInfo";
import { useSelector } from "react-redux";
// import styles from "./AdminPage.module.scss";
import styles from "../../components/Event/Event.module.scss";

// const BigNumber = require("bignumber.js");

// Main function for AdminPage
export const AdminPage = () => {
  
  const account = useSelector((state) => {
    console.log("Admin page");
    return state.account;
  });
  console.log(account);
  
  // Different React states
  const [eventName, setEventName] = React.useState("");
  const [maxSeats, setMaxSeats] = React.useState("");
  const [eventCreateStatus, setEventCreateStatus] = React.useState(false);
  const [eventOwner, setEventOwner] = React.useState("");

  //set contract calls (FROM account for contarct calls)
  useEffect(() => {
    console.log("setting FROM account for eventTicketingToken contract");
    console.log(account);
    eventTicketingTokenInfo.options.from = account;
  }, [account]);
  
  //  storing the  event name
  const onChangeEventName = (event) => {
    // event.preventDefault();
    setEventName(event.target.value);
  };

  // storing the max number of seats
  const onChangeMaxSeats = (event) => {
    // event.preventDefault();
    setMaxSeats(event.target.value);
  };

  //  on click  createEvent Button functinality
  const handleCreateEvent = async (event) => {
    console.log(eventName);
    console.log(maxSeats);
    // setStatus(true);

    await createEvent(eventName, maxSeats)
      .then((res) => {
        console.log("CreateEvent transaction sent..!!");
        console.log(res);
        setEventOwner(account);
        setEventCreateStatus(true);
        alert("Event created successfully..!!");
      })
      .catch((error) => {
        console.log(error);
        alert("Event Creation failed");
      });
  };
  console.log(eventOwner);

  return (
    <div>
      <Card className={styles["eventCreateHalfBox"]}>
        <CardHeader
          // title={props.status === 0 ? "Event Creation Details" : "Event Details"}
          // title={!status ? "Event Details" : "Create Event"}
          title={"Create Event"}
        />
        <CardContent className={styles["flex__column__stretch"]}>
          <TextField
            label="Event Name"
            variant="outlined"
            className={styles["mg-10"]}
            value={eventName}
            onChange={onChangeEventName}
            
          />
          <TextField
            label="Maximum Number of Seats"
            variant="outlined"
            className={styles["mg-10"]}
            value={maxSeats}
            onChange={onChangeMaxSeats}
            // disabled={!!props.status}
            InputProps={{
              endAdornment: (
                <InputAdornment position="start">Seats</InputAdornment>
              ),
              inputComponent: NumberFormatCustom,
            }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleCreateEvent}
            disabled={eventName === "" || maxSeats === 0 || eventCreateStatus}
          >
            Create Event
          </Button>
        </CardContent>
      </Card>

      {eventCreateStatus ? (
        <Card className={styles["eventCreateHalfBox"]}>
          <CardHeader
            // title={props.status === 0 ? "Event Creation Details" : "Event Details"}
            title="Event Details"
          />
          <CardContent className={styles["flex__column__stretch"]}>
            <Typography>Event Name = {eventName}</Typography>
            <Typography>Maximum number of seats = {maxSeats}</Typography>
          </CardContent>
        </Card>
      ) : (
        <div></div>
      )}
    </div>
  );
};

export default AdminPage;
