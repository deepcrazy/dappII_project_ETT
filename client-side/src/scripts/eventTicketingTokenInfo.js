import Web3 from "web3";
import EventTicketingToken from "../contracts/EventTicketingToken.json";

const web3 = new Web3(window.web3.currentProvider);
// const address = "0x45166A684dc43d2F78898166F51Bc10e3728bF1f"; // Contract Address
// const address = "0x16f12E0D52b2bA2b38b5f56ed59250a59AfABBba"; // ropsten address
const address = "0xD833215cBcc3f914bD1C9ece3EE7BF8B14f841bb"; //ganache deployment address
const ABI = EventTicketingToken.abi;

//Web3 connect contract based on ABI and Address
export default new web3.eth.Contract(ABI, address);