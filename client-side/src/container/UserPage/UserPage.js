import React, { useState, useEffect } from "react";
import {
  Typography,
  // TextField,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Box,
  // FormControl,
  Button,
} from "@material-ui/core";
import { green, red, grey } from "@material-ui/core/colors";
// import styles from "./UserPage.module.scss";
import {
  getEventName,
  getMaximumSeats,
  buyToken,
} from "../../scripts/eventTicketingTokenInteract";
import eventTicketingTokenInfo from "../../scripts/eventTicketingTokenInfo";
import Backdrop from "@material-ui/core/Backdrop";
import CircularProgress from "@material-ui/core/CircularProgress";
import { useSelector } from "react-redux";
// import { Alert, AlertTitle } from "@material-ui/lab";
import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/core/styles";
import EventSeatIcon from "@material-ui/icons/EventSeat";
import styles from "../../components/Event/Seats.module.scss";

const useStyles = makeStyles((theme) => ({
  root: {
    color: theme.palette.text.primary,
    primary: red,
  },
  margin: {
    margin: theme.spacing(0.5),
  },
}));

const useCardStyles = makeStyles({
  root: {
    minWidth: 275,
  },
  bullet: {
    display: "inline-block",
    margin: "0 2px",
    transform: "scale(0.8)",
  },
  title: {
    fontSize: 14,
  },
  pos: {
    marginBottom: 12,
  },
});

// Main user page function
function UserPage() {
  const classes = useStyles();
  const classesCard = useCardStyles();

  // get the user logged in address
  const account = useSelector((state) => {
    return state.account;
  });
  
  // Different React states
  const [bookingStatus, setBookingStatus] = useState(false);
  const [status, setStatus] = React.useState(false);
  const [eventName, setEventName] = React.useState("");
  const [maxSeats, setMaxSeats] = React.useState(0);
  // const [eventOwner, setEventOwner] = React.useState("");
  const [seatSelected, setSeatSelected] = React.useState("");
  const [seatSelectedColor, setSeatSelectedColor] = useState(false);

  // On click 'BookSeat' Button  functionality
  const bookseat = async (event) => {
    event.preventDefault();
    console.log("Successfully booked..!!");
    await buyToken(seatSelected)
      .then((res) => {
        console.log(res);
        setBookingStatus(true);
        alert("Successfully booked..!!");
      })
      .catch((error) => {
        console.log(error);
      });
  };

  //set contract calls (FROM address)
  useEffect(() => {
    console.log("setting FROM account for eventTicketingToken contract");
    console.log(account);
    eventTicketingTokenInfo.options.from = account;
  }, [account]);

  // Get Event Name of the  event created  from the  blockchain
  useEffect(() => {
    getEventName()
      .then((res) => {
        console.log("inside event name function - user page");
        console.log(res);
        setEventName(res);
      })
      .catch((error) => {
        console.log(error);
      });
  });

  //  Get the Maximum number  of  seats  for the event created from the blockchain
  useEffect(() => {
    getMaximumSeats()
      .then((res) => {
        console.log("inside maximum seats- user page");
        console.log(res);
        setMaxSeats(res);
        setStatus(true);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [maxSeats]);
  console.log(maxSeats);

  //  On clicking  seat button functionality
  const onClickSeatSelected = (event) => {
    event.preventDefault();
    console.log("coming to seat selected function..!!");
    console.log(event.currentTarget.dataset.seat_id);
    let temp = event.currentTarget.dataset.seat_id;

    if (temp.toString() !== seatSelected.toString()) {
      console.log("coming inside seat temp condition: " + temp);
      setSeatSelectedColor(true);
      setSeatSelected(temp);
    } else {
      setSeatSelected(false);
      setSeatSelected("");
    }
  };
  console.log(seatSelected);

  //  Function to create the maximum number of seats available for  the  event created.
  const createSeats = () => {
    // const classes = useStyles();
    console.log("coming in create seats function..!!");
    let rows = [];
    for (let index = 1; index <= maxSeats; index++) {
      rows.push(
        <div key={index}>
          <Box m={2}></Box>
          <Button
            style={
              seatSelectedColor && seatSelected.toString() === index.toString()
                ? {
                    // borderRadius: 35,
                    backgroundColor: green[300],
                    // padding: "18px 36px",
                    // fontSize: "18px"
                  }
                : { backgroundColor: grey[50] }
            }
            variant="contained"
            color="primary"
            className={classes.margin}
            id={index}
            data-seat_id={index}
            value={index}
            onClick={onClickSeatSelected}
          >
            <Grid container direction="column" className={classes.root}>
              <Grid item xs={3}>
                <EventSeatIcon fontSize="inherit" />
              </Grid>
              <Grid item xs={3}>
                <Typography variant="h6">{index}</Typography>
              </Grid>
            </Grid>
          </Button>
        </div>
      );
    }
    return rows;
  };
  return (
    <div>
      {status ? (
        <Grid container direction="row">
          {/* <Box m={1}></Box> */}
          <Card className={styles["seatsHalfBox"]} variant="outlined">
            <CardContent>
              <Typography
                className={classesCard.title}
                color="textSecondary"
                gutterBottom
              >
                Pick Your Seat
              </Typography>
              <Typography variant="h5" component="h2">
                <Grid container direction="row">
                  {/* <Box m={2}></Box> */}
                  {createSeats()}
                </Grid>
              </Typography>
            </CardContent>
            {/* <CardActions>
            <Button variant="contained" color="primary" onClick={bookseat} size="small">
              Book Seat
            </Button>
          </CardActions> */}
          </Card>

          <Card className={styles["seatSelectedBox"]} variant="outlined">
            <CardContent>
              <Typography
                className={classesCard.title}
                color="textSecondary"
                gutterBottom
              >
                Token Summary
              </Typography>
              <Typography variant="h4" component="h2">
                <Grid container direction="column">
                  <Box m={2}></Box>
                  <Typography variant="h6">
                    {" "}
                    Seat Selected :{" "}
                    {seatSelected > 0 ? seatSelected : "No Seat selected"}
                  </Typography>
                  <Typography variant="h6"> Token Price: 1 ETH</Typography>
                </Grid>
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                variant="contained"
                color="primary"
                onClick={bookseat}
                size="small"
              >
                Book Seat
              </Button>
            </CardActions>
          </Card>

          {bookingStatus ? (
            <Card className={styles["bookedSeatBox"]} variant="outlined">
              <CardHeader title="Booked Token Details" />
              <CardContent>
                <Typography variant="h4" component="h2">
                  <Grid container direction="column">
                    <Box m={2}></Box>
                    <Typography variant="h6">
                      {" "}
                      Event Name : {eventName}
                    </Typography>
                    <Typography variant="h6">
                      {" "}
                      Seat Selected : {seatSelected}
                    </Typography>
                    <Typography variant="h6">
                      {" "}
                      Token Id : {seatSelected}
                    </Typography>
                    <Typography variant="h6"> Payment made: 1 ETH</Typography>
                  </Grid>
                </Typography>
              </CardContent>
            </Card>
          ) : (
            <div></div>
          )}
        </Grid>
      ) : (
        <div>
          <Backdrop open={true}>
            <CircularProgress color="secondary" />
          </Backdrop>
        </div>
      )}

    </div>
  );
}

export default UserPage;
