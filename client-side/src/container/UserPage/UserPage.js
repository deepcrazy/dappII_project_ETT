import React, { useState, useEffect } from "react";
import {
  Typography,
  TextField,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  CardMedia,
  IconButton,
  Box,
  FormControl,
  Button,
} from "@material-ui/core";
import { green, purple, red, grey, blueGrey } from "@material-ui/core/colors";
// import Verification from "../../components/Verification/Verification";
// import styles from "./UserPage.module.scss";
// import Loan from "../../components/Loan/Loan";
// import {
//   userLogin,
//   getCredId,
//   requestLoan,
//   acceptLoan as acceptLoanContract,
//   getLoan,
// } from "../../delete_file/loanContractInteract";
import {
  createEvent,
  getMaximumSeats,
  buyToken,
} from "../../scripts/eventTicketingTokenInteract";
// import credTokenInfo from "../../delete_file/credTokenInfo";
import eventTicketingTokenInfo from "../../scripts/eventTicketingTokenInfo";
// import { makePayment } from "../../delete_file/credTokenInteract";
import Backdrop from "@material-ui/core/Backdrop";
import CircularProgress from "@material-ui/core/CircularProgress";
import { useSelector } from "react-redux";
import moment from "moment";
import { Alert, AlertTitle } from "@material-ui/lab";
import Grid from "@material-ui/core/Grid";
import { makeStyles, useTheme, withStyles } from "@material-ui/core/styles";
import EventSeatIcon from "@material-ui/icons/EventSeat";
import SkipPreviousIcon from "@material-ui/icons/SkipPrevious";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import SkipNextIcon from "@material-ui/icons/SkipNext";
import styles from "../../components/Event/Seats.module.scss";

const useStyles = makeStyles((theme) => ({
  root: {
    color: theme.palette.text.primary,
    primary: red,
    // color : green
    // backgroundColor : green,
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

function UserPage() {
  const classes = useStyles();
  const classesCard = useCardStyles();
  const theme = useTheme();

  const account = useSelector((state) => {
    return state.account;
  });

  // const maximumSeats = useSelector(state => {
  //   return state.maximumSeats;
  // })
  const [bookingStatus, setBookingStatus] = useState(false);

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

  const [status, setStatus] = React.useState(false);
  const [eventName, setEventName] = React.useState("");
  const [maxSeats, setMaxSeats] = React.useState(0);
  const [eventOwner, setEventOwner] = React.useState("");
  const [seatSelected, setSeatSelected] = React.useState("");

  //set contract calls
  useEffect(() => {
    console.log("setting FROM account for eventTicketingToken contract");
    console.log(account);
    eventTicketingTokenInfo.options.from = account;
  }, [account]);

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

  const onChangeEventName = (event) => {
    event.preventDefault();
    setEventName(event.target.value);
  };

  const onChangeMaxSeats = (event) => {
    event.preventDefault();
    setMaxSeats(event.target.value);
  };

  //handler for accept loan button click
  // const acceptLoan = () => {
  //   //accept Request
  //   acceptLoanContract(loanId, true).then(res => {
  //     setLoanStatus(4); //set corresponding state
  //     setLoanRequestDates(prevState => {
  //       //set corresponding date
  //       let temp = prevState;
  //       temp[2] = moment().format("X");
  //       return temp;
  //     });
  //   });
  // };

  const handleCreateEvent = (event) => {
    console.log(eventName);
    console.log(maxSeats);
    setStatus(true);

    createEvent(eventName, 12, maxSeats).then((res) => {
      console.log("CreateEvent transaction sent..!!");
      console.log(res);
      setEventOwner(account);
    });

    alert("Event created successfully..!!");
  };
  console.log(eventOwner);
  const [seatSelectedColor, setSeatSelectedColor] = useState(false);

  const onClickSeatSelected = (event) => {
    event.preventDefault();
    console.log("coming to seat selected function..!!");
    console.log(event.currentTarget.dataset.seat_id);
    let temp = event.currentTarget.dataset.seat_id;

    if (temp.toString() != seatSelected) {
      console.log("coming inside seat temp condition: " + temp);
      setSeatSelectedColor(true);
      setSeatSelected(temp);
    } else {
      setSeatSelected(false);
      setSeatSelected("");
    }

    // setSeatSelectedColor(!seatSelectedColor);
    // setSeatSelected(temp);
  };
  console.log(seatSelected);

  const SeatButton = withStyles((theme) => ({
    root: {
      color: theme.palette.getContrastText(grey[50]),
      backgroundColor: grey[50],
      "&:hover": {
        backgroundColor: grey[50],
      },
    },
    // selectedColor: {
    //   color: theme.palette.getContrastText(green[300]),
    //   backgroundColor: green[300],
    //   "&:hover": {
    //     backgroundColor: green[300],
    //   },
    // },
  }))(Button);

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
              seatSelectedColor && seatSelected == index
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
            {/* <Box m={2}></Box> */}
            <Grid container direction="column" className={classes.root}>
              <Grid item xs={3}>
                <EventSeatIcon fontSize="inherit" />
                {/* <DeleteForeverIcon /> */}
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
      {true ? (
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
                {/* <Typography
                className={classesCard.title}
                color="textSecondary"
                gutterBottom
              >
                Booked Token
              </Typography> */}
                <Typography variant="h4" component="h2">
                  <Grid container direction="column">
                    <Box m={2}></Box>
                    <Typography variant="h6">
                      {" "}
                      Event Name : {"Exhibition April 2020"}
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
          <Typography variant="h5"> No Events available</Typography>
        </div>
      )}

      {/* <Card className={classes.root}>
      <div className={classes.details}>
        <CardContent className={classes.content}>
          <Typography component="h5" variant="h5">
            Live From Space
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Mac Miller
          </Typography>
        </CardContent>
        <div className={classes.controls}>
          <IconButton aria-label="previous">
            {theme.direction === 'rtl' ? <SkipNextIcon /> : <SkipPreviousIcon />}
          </IconButton>
          <IconButton aria-label="play/pause">
            <PlayArrowIcon className={classes.playIcon} />
          </IconButton>
          <IconButton aria-label="next">
            {theme.direction === 'rtl' ? <SkipPreviousIcon /> : <SkipNextIcon />}
          </IconButton>
        </div>
      </div>
      <CardMedia
        className={classes.cover}
        image="/static/images/cards/live-from-space.jpg"
        title="Live from space album cover"
      />
    </Card> */}
    </div>
  );
}

export default UserPage;
// /*global document alert*/

// 'use strict';

// import React from 'react';
// import ReactDOM from 'react-dom';
// import { connect } from 'react-redux';
// import moment from 'moment';
// import { sortAlphaNumeric, rowMap, SEATS_IN_ROW, BASE_FARE, RESERVATION_CHARGES } from '../../utils';

// class SeatSelection extends React.Component {
//   constructor () {
//     super();
//     this.state = {
//       selectedSeatsIndex: [],
//       selectedSeats: []
//     };
//     this.handleSeatSelection = (event) => this._handleSeatSelection(event);
//     this.getSeatsLayout = (data) => this._getSeatsLayout(data);
//     this.getMovieSummary = (data) => this._getMovieSummary(data);
//   }

//   _handleSeatSelection(event) {
//     let clickedSeat = parseInt(event.target.id),
//         row = rowMap[Math.floor(clickedSeat / SEATS_IN_ROW)],
//         rowNum = (clickedSeat % SEATS_IN_ROW) + 1,
//         selectedSeat = row+rowNum,
//         selection = this.state.selectedSeats,
//         alreadyExistingId = selection.indexOf(selectedSeat),
//         selectedIndex = this.state.selectedSeatsIndex;
//     if (alreadyExistingId > -1) {
//       selection.splice(alreadyExistingId, 1);
//       selectedIndex.splice(selectedIndex.indexOf(clickedSeat), 1);
//     }
//     else {
//       if (this.state.selectedSeats.length >= 15) {
//         alert("Maximum seats allowed per transaction is 15")
//         return;
//       }
//       selection.push(selectedSeat);
//       selectedIndex.push(clickedSeat);
//     }
//     this.setState({
//       selectedSeats: selection,
//       selectedSeatsIndex: selectedIndex
//     })
//   }

//   _getSeatsLayout (data = []) {
//     let head, cells,
//         rows=[];
//     if (data) {
//       for (let i=0; i<data.length/SEATS_IN_ROW; i++){
//         rows.push(data.slice(i*SEATS_IN_ROW, (i*SEATS_IN_ROW)+SEATS_IN_ROW));
//       }
//       head = rows.map( (item, index) => {
//         let keyBase = (index * SEATS_IN_ROW);
//         cells = item.map((itm, indx) => {
//           let key = keyBase+indx,
//               seatNumber = indx + 1;
//           if (itm === 0) {
//             return (
//               <div key={key} id={key} className="seat seat-occupied">
//                 {seatNumber}
//               </div>
//             );
//           }
//           else {
//             let seatStyle = this.state.selectedSeatsIndex.indexOf(key) > -1 ? "seat seat-free selected" : "seat seat-free";
//             return (
//               <div key={key} id={key} className={seatStyle} onClick={this.handleSeatSelection}>
//                 {seatNumber}
//               </div>
//             );
//           }
//         });

//         return (
//           <div key={index} className="seat-rows">
//             <div key="0" className="seat-row-name">{rowMap[index]}</div>
//             {cells}
//           </div>
//         )
//       });
//     }
//     return head;
//   }

//   _getMovieSummary (data = {}) {
//     let movieDetailsStyle = "movie-details-items",
//         summaryStyle = "summary-text",
//         selectedSeats = this.state.selectedSeats.length;
//     return (
//       <div className="movie-details">
//           <div className="ticket-summary-text"> Ticket Summary </div>
//           <div className={movieDetailsStyle}>
//             Selected Movie
//             <div className={summaryStyle}> {data.movieName} </div>
//           </div>
//           <div className={movieDetailsStyle}>
//             Screen
//             <div className={summaryStyle}>
//               {data.screen}
//             </div>
//           </div>
//           <div className={movieDetailsStyle}>
//             Show Time
//             <div className={summaryStyle}> {moment(data.date).format('MMM, DD YYYY HH:mm')} </div>
//           </div>
//           <div className={movieDetailsStyle}>
//             Seats {selectedSeats > 0 ? ' - ' + selectedSeats : ''}
//             <div className={summaryStyle}>
//               { selectedSeats > 0 ?
//                 this.state.selectedSeats.sort(sortAlphaNumeric).join(', ') :
//                 '-'
//               }
//              </div>
//           </div>
//           <div className="amount-text">
//             <div className="price-summary">
//               Ticket Price: {selectedSeats > 0 ?  selectedSeats * BASE_FARE : 0}
//               <div>
//                 Booking Charges: {selectedSeats > 0 ?  selectedSeats * RESERVATION_CHARGES : 0}
//               </div>
//             </div>
//             Total Amount Rs. {selectedSeats * (BASE_FARE + RESERVATION_CHARGES)}
//           </div>
//       </div>
//     )
//   }

//   getLegendLayout () {
//     return (
//       <div className="legend-items">
//         <div className="legend-item-container">
//           <div className="seat-free legend-item">
//           </div>
//           <span>Available</span>
//         </div>
//         <div className="legend-item-container">
//           <div className="seat-occupied legend-item">
//           </div>
//           <span>Booked</span>
//         </div>
//         <div className="legend-item-container">
//           <div className="seat-free selected legend-item">
//           </div>
//           <span>Selected</span>
//         </div>
//       </div>
//     )
//   }

// render () {
//     let info = this.props.info ? this.props.info : [];
//       if (info) {
//         return (
//           <div className="container-fluid">
//             <div className="panel panel-container">
//               <div className="panel-heading">
//                 <div className="pick-seat-text">
//                   Pick your seats
//                 </div>
//               </div>
//               <div className="panel-body">
//                 <div className="panel-body-container">
//                   <div className="seat-container">
//                       <div className="screen">Screen facing this way</div>
//                       <div className="seat-layout">
//                         {this.getSeatsLayout(this.props.layout ? this.props.layout.seatLayout : [])}
//                       </div>
//                   </div>
//                   <div className="movie-details-container">
//                       {this.getMovieSummary(this.props.info ? this.props.info : {})}
//                   </div>
//                 </div>
//               </div>
//               <div className="panel-footer flex-footer">
//                 {this.getLegendLayout()}
//                 <div className="button-checkout-container">
//                   <button className="btn button-success" onClick={() => alert("Thank you!")}>Checkout</button>
//                 </div>
//             </div>
//             </div>
//           </div>
//         );
//       } else {
//         return (
//           <div>
//              <div className="loader" height='100px' width='100px'>Testing and test working</div>
//           </div>
//         );
//       }
//   }
// }

// function select (state) {
//   return {
//     info: state.info,
//     layout: state.layout
//   };
// }

// export default connect(select)(SeatSelection);
