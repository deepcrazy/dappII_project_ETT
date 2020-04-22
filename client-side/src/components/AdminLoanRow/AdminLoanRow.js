// import React from "react";
// import {
//   Table,
//   TableBody,
//   TableRow,
//   TableCell,
//   Box,
//   TextField,
//   Button,
//   Tooltip
// } from "@material-ui/core";
// import { Edit, Close, Check, Remove } from "@material-ui/icons";
// import moment from "moment";
// import styles from "./AdminLoanRow.module.scss";
// import { approveLoan } from "../../scripts/loanContractInteract";
// import { sendContract } from "../../scripts/credTokenInteract"
// import { LoanStatusRow } from "../LoanStatusRow/LoanStatusRow";

// export function AdminLoanRow({ data, editable = false, update }) {
//   const [status, setStatus] = React.useState(data.status);
//   // const [terms, setTerms] = React.useState(data.requestedTerms); //requested terms
//   const [newTerms, setNewTerms] = React.useState(data.requestedTerms); //input terms
//   const [approvedTerms, setApprovedTerms] = React.useState(
//     Number(data.status) <= 1 ? data.requestedTerms : data.approvedTerms
//   ); //approvedTerms
//   const [edit, setEdit] = React.useState(false); //turn on edit mode
//   const [allowSubmit, setAllowSubmit] = React.useState(true); //checks if there are values in the approved section

//   React.useEffect(() => {
//     const values = Object.values(newTerms || {});
//     const check = values.every(val => val !== "");
//     setAllowSubmit(check);
//   }, [newTerms]);

//   const editNewTerms = event => {
//     const key = event.target.id;
//     let value = parseFloat(event.target.value);
//     value = isNaN(value) ? "" : value;
//     setNewTerms({ ...newTerms, [key]: value });
//   };

//   let termOutput = data.terms;
//   if (editable) {
//     const loanParams = Object.keys(data.requestedTerms);
//     const loanUnits = {
//       amount: "DAI",
//       interestRate: "%",
//       duration: "month(s)"
//     };
//     termOutput = (
//       <Box className={styles["AdminLoanRow__termTable"]}>
//         <Table>
//           <TableBody>
//             {loanParams.map((param, ind) => {
//               //https://stackoverflow.com/questions/7225407/convert-camelcasetext-to-sentence-case-text
//               let paramName = param.replace(/([A-Z])/g, " $1");
//               paramName =
//                 paramName.charAt(0).toUpperCase() + paramName.slice(1);

//               return (
//                 <TableRow key={param}>
//                   <TableCell>{`${paramName}:`}</TableCell>
//                   <TableCell align="right">
//                     {data.requestedTerms[param]} {loanUnits[param]}
//                   </TableCell>

//                   <TableCell align="right" padding="none">
//                     <Box className={styles["AdminLoanRow__terms"]}>
//                       {edit ? (
//                         <InputDisplay
//                           value={newTerms[param]}
//                           id={param}
//                           onChange={editNewTerms}
//                         />
//                       ) : (
//                         <React.Fragment>
//                           {approvedTerms[param]} {loanUnits[param]}
//                         </React.Fragment>
//                       )}
//                     </Box>
//                   </TableCell>
//                 </TableRow>
//               );
//             })}
//           </TableBody>
//         </Table>
//       </Box>
//     );
//   }

//   const toggleEdit = () => {
//     setEdit(!edit);
//   };

//   const submitEdits = () => {
//     setApprovedTerms({ ...data.requestedTerms, ...newTerms });
//     toggleEdit();
//   };

//   const yesNo = {
//     yes: () => {
//       const step = status === 1 ? 1 : 2;
//       switch (status) {
//         case 1: //approve loan
//           approveLoan(data.credID, approvedTerms, true).then(res => {
//             setStatus(status + step);
//           });
//           break;
//         case 4: //fund loan
//           sendContract("fundLoan", data.credID, true).then(res => {
//             setStatus(status + step);
//             update.set(!update.val);
//           });
//           break;
//         default:
//       }
//     },
//     no: () => {
//       const step = status === 1 ? 2 : 3;
//       switch (status) {
//         case 1: //approve loan
//           approveLoan(data.credID, approvedTerms, false).then(res => {
//             setStatus(status + step);
//           });
//           break;
//         case 4: //fund loan
//           sendContract("fundLoan", data.credID, false).then(res => setStatus(status + step));
//           break;
//         default:
//       }
//     }
//   };

//   //Loan Status Reference
//   // 0 - no loan request
//   // 1 - loan requested
//   // 2 - loan approved
//   // 3 - loan not approved
//   // 4 - loan accepted
//   // 5 - loan not accepted
//   // 6 - loan funded
//   // 7 - loan not funded
//   const loanStatus = (
//     <Table size="small">
//       <TableBody>
//         <LoanStatusRow
//           name={"Requested"}
//           passed={status > 0}
//           failed={status === 0}
//         />
//         <LoanStatusRow
//           name={"Approved"}
//           passed={status >= 2}
//           failed={status === 3}
//           choose={status === 1}
//           onClick={yesNo}
//           isDisabled={edit}
//         />
//         <LoanStatusRow
//           name={"Accepted"}
//           passed={status >= 4}
//           failed={status === 5}
//         />
//         <LoanStatusRow
//           name={"Funded"}
//           passed={status >= 6}
//           failed={status === 7}
//           choose={status === 4}
//           onClick={yesNo}
//         />
//       </TableBody>
//     </Table>
//   );

//   const paymentIcon = {
//     0: <Remove />,
//     1: <Check color="primary" />,
//     2: <Close color="secondary" />
//   };

//   const getNextPaymentDate = () => {
//     const nextPaymentInd = data.paymentDetails.statuses.findIndex(
//       val => Number(val) === 0
//     );
//     if (nextPaymentInd !== -1) {
//       const timestamp = data.paymentDetails.dueDates[nextPaymentInd];
//       return moment.unix(timestamp).format("D MMM YYYY");
//     } else if (!data.paymentDetails.dueDates.length) {
//       return "--";
//     } else {
//       return "All payments complete";
//     }
//   };

//   const paymentDetailsOutput =
//     Number(status) === 6 ? (
//       <Table>
//         <TableBody>
//           <TableRow>
//             <TableCell>Monthly Payment</TableCell>
//             <TableCell>{data.paymentDetails.monthlyPayment} DAI</TableCell>
//           </TableRow>
//           <TableRow>
//             <TableCell>Payment History</TableCell>
//             <TableCell>
//               <Box className={styles["flex__row"]}>
//                 {data.paymentDetails.statuses.map((status, ind) => {
//                   return (
//                     <Tooltip
//                       key={`payment-${ind}`}
//                       interactive
//                       title={
//                         <div style={{ fontSize: "1rem" }}>
//                           {`Payment Due: ${moment
//                             .unix(data.paymentDetails.dueDates[ind])
//                             .format("D MMM YYYY")}`}
//                           <br />
//                           {`Payment Made: ${
//                             status === 0 ? "pending" : "<insert date>"
//                           }`}
//                         </div>
//                       }
//                     >
//                       {paymentIcon[status]}
//                     </Tooltip>
//                   );
//                 })}
//               </Box>
//             </TableCell>
//           </TableRow>
//           <TableRow>
//             <TableCell>Next Payment Due</TableCell>
//             <TableCell>{getNextPaymentDate()}</TableCell>
//           </TableRow>
//         </TableBody>
//       </Table>
//     ) : (
//       "n/a"
//     );
//   return (
//     <TableRow>
//       <TableCell>
//         <Tooltip title="Copy for complete ID">
//           <Box className={styles["AdminLoanRow__smallCell"]}>
//             {data.loanNum}
//           </Box>
//         </Tooltip>
//       </TableCell>
//       <TableCell>
//         <Tooltip title="Copy for complete ID">
//           <Box className={styles["AdminLoanRow__smallCell"]}>{data.credID}</Box>
//         </Tooltip>
//       </TableCell>
//       <TableCell>{termOutput}</TableCell>
//       <TableCell>
//         <div className={styles["AdminLoanRow__editButton"]}>
//           {editable ? (
//             edit ? (
//               <div>
//                 <Button
//                   onClick={submitEdits}
//                   color="primary"
//                   disabled={!allowSubmit}
//                 >
//                   <Check />
//                 </Button>
//                 <Button onClick={toggleEdit} color="secondary">
//                   <Close />
//                 </Button>
//               </div>
//             ) : Number(status) === 1 ? (
//               <Button onClick={toggleEdit}>
//                 <Edit />
//               </Button>
//             ) : (
//               ""
//             )
//           ) : (
//             "Edit"
//           )}
//         </div>
//       </TableCell>
//       <TableCell align="left">{editable ? loanStatus : status}</TableCell>
//       <TableCell align={editable ? "center" : "left"}>
//         {data.status !== "Request Status"
//           ? paymentDetailsOutput
//           : data.paymentDetails}
//       </TableCell>
//     </TableRow>
//   );
// }

// const InputDisplay = props => {
//   return (
//     <div className={styles["AdminLoanRow__input"]}>
//       <TextField {...props} type="number" />
//     </div>
//   );
// };

// export default AdminLoanRow;
