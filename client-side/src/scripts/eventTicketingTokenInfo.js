import Web3 from "web3";
// import SneakerFactory from "../contracts/EventTicketingToken.json.json";
import EventTicketingToken from "../contracts/EventTicketingToken.json";

const web3 = new Web3(window.web3.currentProvider);
// const address = "0x45166A684dc43d2F78898166F51Bc10e3728bF1f"; // Contract Address
// const address = "0x16f12E0D52b2bA2b38b5f56ed59250a59AfABBba"; // ropsten address
const address = "0xe78A0F7E598Cc8b0Bb87894B0F60dD2a88d6a8Ab"; //ganache deployment address
// const ABI = LoanContract.abi; // Contract ABI
const ABI = EventTicketingToken.abi;

//Web3 connect contract based on ABI and Address
export default new web3.eth.Contract(ABI, address);