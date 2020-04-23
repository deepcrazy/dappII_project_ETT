import contractInfo from "./eventTicketingTokenInfo";

const BN = require("bn.js");

const scaleFactorBN = new BN(10).pow(new BN(18));   //  This basically is 1e18 i.e. 1 ether
// value = scaleFactorBN.mul(new BN(scaleFactor))

// @notice Check the user is owner or not
// @return true or false (bool)
export const isEventOwner = () => {
    return new Promise(async (resolve, reject) => {
      try {
        let checkOwner = await contractInfo.methods.isEventOwner().call();
        console.log(checkOwner);
        resolve(checkOwner);
      } catch (error) {
        reject(error);
      }
    });
  };

// export const acceptLoan = (loanId, yesNo) => {
//     return new Promise(async (resolve, reject) => {
//       try {
//         await contractInfo.methods
//           .acceptLoan(loanId, yesNo)
//           .send()
//           .once("receipt", async result => {
//             console.log(result);
//             resolve(result);
//           });
//       } catch (error) {
//         reject(error);
//       }
//     });
//   };

export const getMaximumSeats = () => {
    console.log("getting  maximum seats");
    return new Promise(async (resolve, reject) => {
      try {
        let maximumSeats = await contractInfo.methods
        .getMaximumSeats()
        .call();
        console.log(maximumSeats);
        resolve(maximumSeats);
      } catch (error) {
        reject(error);
      }
    });
  }
// export const getMaximumSeats = () => {
//     return  true;
// }

export const createEvent = (eventName, maxSeats) => {
    console.log("coming  in web3 ETT");
    console.log(eventName);
    // console.log(eventId);
    console.log(maxSeats);
    return new Promise(async (resolve, reject) => {
        try{
            console.log("inside try");
            console.log(contractInfo.options.from);
            console.log(eventName);
    // console.log(eventId);
    console.log(maxSeats);
            await contractInfo.methods
            .createEvent(eventName, Number(maxSeats))
            .send({gas: 470000})
            .once("receipt", async result => {
                console.log("success");
                console.log(result);
                resolve(result);
            });
        } catch (error) {
            console.log("error in creating")
            reject(error);
        }
    })
}

export const buyToken = (tokenId) => {
  return new Promise(async (resolve, reject) => {
    try{
      console.log("inside try of buy toke funciton");
      console.log(new BN(tokenId));
      await contractInfo.methods.buyToken(new BN(tokenId)).send({gas: 470000, value: scaleFactorBN})
      .once("receipt", async result => {
        console.log(result);
        resolve(result);
      });
    } catch (error) {
      reject(error);
    }
  })
}