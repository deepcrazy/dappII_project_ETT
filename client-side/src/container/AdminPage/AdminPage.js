// import React, { useState, useEffect } from "react";
import React, { useEffect } from "react";
import {
  // Box,
  Typography,
  // Table,
  // TableContainer,
  // TableHead,
  // TableBody,
  // TableRow,
  // TableCell,
  // Paper,
  TextField,
  Button,
  Card,
  CardContent,
  CardHeader,
  InputAdornment
} from "@material-ui/core";
import { NumberFormatCustom } from "../../utils";
import {
  createEvent,
  // getMaximumSeats
} from "../../scripts/eventTicketingTokenInteract";
// import { AdminLoanRow } from "../../components/AdminLoanRow/AdminLoanRow";
import eventTicketingTokenInfo from "../../scripts/eventTicketingTokenInfo";
// import { getCredIds, getLoanAdmin } from "../../delete_file/loanContractInteract";
// import shareholderContractInfo from "../../delete_file/shareholderContractInfo";
// import credTokenInfo from "../../delete_file/credTokenInfo";
// import {
//   sendContract,
//   getBalances,
//   getStatusRate,
//   getLoanData,
//   scaleFactor
// } from "../../delete_file/shareholderContractInteract";
import { useSelector } from "react-redux";
// import ButtonFormCombination from "../../components/ButtonFormCombination/ButtonFormCombination";
// import styles from "./AdminPage.module.scss";
import styles from "../../components/Event/Event.module.scss";
// import styles from "./Loan.module.scss";
const BigNumber = require("bignumber.js");

// const getShareholderData = setData => {
//   // console.log(typeof setData);

//   //functions to get status, balance, total supply, rate
//   getStatusRate().then(res => {
//     setData(prev => {
//       return { ...prev, 'Rate': res.rate, 'Status':res.status };
//     });
//   });
//   getBalances().then(res => {
//     setData(prev => {
//       return {
//         ...prev,
//         "Total supply": res.totalSupply
//       };
//     });
//   });

//   //get data (raised, deployable, etc)
//   getLoanData().then(res => {
//     setData(prev => {
//       return {
//         ...prev,
//         ...res,
//         Raised: res.Deployable
//       };
//     });
//   });
// };

export const AdminPage = () => {
  const [loanData, setLoanData] = React.useState([
    
  ]);

  const account = useSelector(state => {
    console.log("Admin page");
    return state.account;
  });
  console.log(account);

  // const [shareholderData, setShareholderData] = React.useState({
  //   Status: "--",
  //   Rate: "--",
  //   "Total supply": "--",
  //   Raised: "--",
  //   Deployable: "--",
  //   Deployed: "--",
  //   Receivable: "--",
  //   Collected: "--",
  //   Defaulted: "--"
  // });
  // const [val, set] = React.useState(false)
  // const updateTrigger = {val, set};

  // const shareholderDataLabel = key => {
  //   switch (key) {
  //     case "Status":
  //       const status = Number(shareholderData[key]) || 0;
  //       switch (status) {
  //         case 1:
  //           return "Deploying";
  //         case 2:
  //           return "Distributing";
  //         default:
  //           return "Fundraising";
  //       }
  //     case "rate":
  //       return "DAI = 1 CRED";
  //     case "Total supply":
  //       return "CRED";

  //     default:
  //       return "DAI";
  //   }
  // };

  // React.useEffect(() => {
  //   // https://dev.to/pallymore/clean-up-async-requests-in-useeffect-hooks-90h
  //   getCredIds().then(async ids => {
  //     //get all cred Ids
  //     let data = [];
  //     for (let i = 0; i < ids.length; i++) {
  //       //pull data from credIds
  //       try {
  //         const loan = await getLoanAdmin(ids[i]);
  //         data.push({
  //           loanNum: loan.loanId,
  //           credID: ids[i],
  //           requestedTerms: {
  //             amount: loan.requestedLoan._principalAmt,
  //             interestRate: loan.requestedLoan._interestRate,
  //             duration: loan.requestedLoan._duration
  //           },
  //           approvedTerms: {
  //             amount: loan.approvedLoan
  //               ? loan.approvedLoan._principalAmt
  //               : "--",
  //             interestRate: loan.approvedLoan
  //               ? loan.approvedLoan._interestRate
  //               : "--",
  //             duration: loan.approvedLoan ? loan.approvedLoan._duration : "--"
  //           },
  //           paymentDetails: {
  //             monthlyPayment: loan.payment
  //               ? loan.payment._monthlyPayment
  //               : "--",
  //             statuses: loan.payment ? loan.payment._statuses : "--",
  //             dueDates: loan.payment ? loan.payment._duedates : "--"
  //           },
  //           status: Number(loan.loanStatus)
  //         });
  //       } catch (e) {
  //         //handler if the credId does not have an active loan
  //         console.log(`${ids[i]} does not have an active loan`);
  //       }
  //     }
  //     setLoanData(data);
  //   });
  //   return () => {};
  // }, []);

  // //set contract calls
  // React.useEffect(() => {
  //   shareholderContractInfo.options.from = account;
  //   credTokenInfo.options.from = account;
  // }, [account])

  //get shareholder contract data
  // React.useEffect(() => {
  //   getShareholderData(setShareholderData);
  // }, [loanData, updateTrigger.val]);

  //loan table header
  // const loanTableHeader = {
  //   loanNum: "Loan Number",
  //   credID: "credID",
  //   terms: "Loan Terms: Requested / Approved",
  //   status: "Request Status",
  //   paymentDetails: "Payment Details"
  // };

  // const defaultLoan = amt => {
  //   return new Promise((res, rej) => {
  //     //function to default loan amount
  //     sendContract("defaultLoan", new BigNumber(amt * scaleFactor))
  //       .then(output => {
  //         getShareholderData(setShareholderData);
  //         res(output);
  //       })
  //       .catch(error => rej(error));
  //   });
  // };

  // const changeStatus = () => {
  //   sendContract("changeStatus")
  //     .then(() => getShareholderData(setShareholderData))
  //     .catch(e => console.log(e));
  // };

     //set contract calls
     useEffect(() => {
      console.log("setting FROM account for eventTicketingToken contract")
      console.log(account);
      eventTicketingTokenInfo.options.from = account;
    }, [account])

  const [status, setStatus] = React.useState(false);
  const [eventName, setEventName] = React.useState("");
  const [maxSeats, setMaxSeats] = React.useState("");
  const [eventCreateStatus, setEventCreateStatus] = React.useState(false);

  const onChangeEventName = event => {
    // event.preventDefault();
    setEventName(event.target.value);
  };

  const onChangeMaxSeats = event => {
    // event.preventDefault();
    setMaxSeats(event.target.value);
  };

  const [eventOwner, setEventOwner] = React.useState("");

  const handleCreateEvent = async (event) => {
    console.log(eventName);
    console.log(maxSeats);
    setStatus(true);

    await createEvent(eventName, maxSeats).then(res => {
        console.log("CreateEvent transaction sent..!!");
        console.log(res);
        setEventOwner(account);
        setEventCreateStatus(true);
        alert("Event created successfully..!!");
      }).catch(error => {
        console.log(error);
        alert("Event Creation failed");
      })
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
          // disabled={!!props.status}
          // InputProps={{
          //   endAdornment: <InputAdornment position="start">Ether</InputAdornment>,
          //   inputComponent: NumberFormatCustom
          // }}
        />
        <TextField
          label="Maximum Number of Seats"
          variant="outlined"
          className={styles["mg-10"]}
          value={maxSeats}
          onChange={onChangeMaxSeats}
          // disabled={!!props.status}
          InputProps={{
            endAdornment: <InputAdornment position="start">Seats</InputAdornment>,
            inputComponent: NumberFormatCustom
          }}
        />
        {/* <TextField
          label="Duration"
          variant="outlined"
          className={styles["mg-10"]}
          value={props.loanRequest.duration}
          onChange={props.change("duration")}
          disabled={!!props.status}
          InputProps={{
            endAdornment: (
              <InputAdornment position="start">months</InputAdornment>
            ),
            inputComponent: NumberFormatCustom
          }}
        /> */}
        <Button
          variant="contained"
          color="primary"
          onClick={handleCreateEvent}
          disabled={
            eventName === "" ||
            maxSeats == 0 ||
            eventCreateStatus
          }
        >
          Create Event
        </Button>
      </CardContent>
    </Card>

    {eventCreateStatus ? <Card className={styles["eventCreateHalfBox"]}>
    <CardHeader
        // title={props.status === 0 ? "Event Creation Details" : "Event Details"}
        title="Event Details"
      />
      <CardContent className={styles["flex__column__stretch"]}>
        <Typography>
          Event Name = {eventName}
        </Typography>
        <Typography>
          Maximum number of seats = {maxSeats}
        </Typography>
      </CardContent>
    </Card> : <div></div>}
    
    </div>
  )
};

export default AdminPage;
