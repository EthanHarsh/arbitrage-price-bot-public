const getPair = require("./utils/getPair");
const mongoose = require("mongoose");
const { WFTM, USDC, DAI, FUSDT, MIM } = require("./static/tokens");

const axios = require("axios").default;
const {
  usdcFtmLpContract,
  daiFtmLpContract,
  fusdtFtmLpContract,
  mimFtmLpContract,
} = require("./static/lpContracts");
const saveTx = require("./utils/writeTransaction");

mongoose.connect(process.env.MONGO_URI).then(() => mainLoop());

async function mainLoop() {
  console.log("Comparing Stable Prices");
  const { usdcPair, daiPair, fusdtPair, mimPair } = await getLPPairs();

  await comparePrice(usdcPair, daiPair);
  await comparePrice(usdcPair, fusdtPair);
  await comparePrice(usdcPair, mimPair);
  await comparePrice(daiPair, fusdtPair);
  await comparePrice(daiPair, mimPair);
  await comparePrice(fusdtPair, mimPair);

  mainLoop();
}

async function comparePrice(pair1, pair2) {
  console.log(`Comparing ${pair1.stableName} to ${pair2.stableName}`);
  const pair1USD = pair1.stablePrice * pair1.ftmPrice;
  const pair2USD = pair2.stablePrice * pair2.ftmPrice;
  const pair1Goal = pair2USD * 1.02;
  const pair2Goal = pair1USD * 1.02;
  console.log(`${pair1.stableName} is ${pair1USD} USD`);
  console.log(`${pair1.stableName} goal is ${pair1Goal} USD`);
  if (pair1USD > pair1Goal) {
    const priceDifference = pair1USD - pair2USD;
    console.log(`${pair1.stableName} is ${priceDifference} USD higher than ${pair2.stableName}`);
    const sell = pair1.stableName;
    const buy = pair2.stableName;
    const sellPrice = pair1USD;
    const buyPrice = pair2USD;
    const profit = sellPrice - buyPrice;
    const action = `Trade ${sell} for ${buy}`;
    console.log(`${action} => Profit: $${profit} per token.`);
    const date = new Date();
    const data = {
      sell,
      buy,
      flag: 'normal',
      tradeAmount: -1,
    };
    await publishMessage(data);
    await saveTx({
      action,
      sell,
      buy,
      profit,
      sellPrice,
      buyPrice,
      time: date.getTime(),
      humanTime: date.toUTCString(),
      exchange: "Spookyswap - Stables",
    });
  } else if (pair2USD > pair2Goal) {
    const priceDifference = pair2USD - pair1USD;
    console.log(`${pair2.stableName} is ${priceDifference} USD higher than ${pair1.stableName}`);
    const sell = pair2.stableName;
    const buy = pair1.stableName;
    const sellPrice = pair2USD;
    const buyPrice = pair1USD;
    const profit = sellPrice - buyPrice;
    const action = `Trade ${sell} for ${buy}`;
    console.log(`${action} => Profit: $${profit} per token.`);
    const date = new Date();
    const data = {
      sell,
      buy,
      flag: 'normal',
      tradeAmount: -1,
    };
    await publishMessage(data);
    await saveTx({
      action,
      sell,
      buy,
      profit,
      sellPrice,
      buyPrice,
      time: date.getTime(),
      humanTime: date.toUTCString(),
      exchange: "Spookyswap - Stables",
    });
  }
}

async function getLPPairs() {
  // USDC-FTM
  const usdcPair = await getPair(
    usdcFtmLpContract,
    "USDC-FTM LP",
    USDC,
    WFTM,
    WFTM,
    "USDC"
  );
  // FTM-DAI
  const daiPair = await getPair(
    daiFtmLpContract,
    "FTM-DAI LP",
    DAI,
    WFTM,
    DAI,
    "DAI"
  );
  // fUSDT-FTM
  const fusdtPair = await getPair(
    fusdtFtmLpContract,
    "FUSDT-FTM LP",
    FUSDT,
    WFTM,
    WFTM,
    "FUSDT"
  );

  // FTM-MIM
  const mimPair = await getPair(
    mimFtmLpContract,
    "FTM-MIM LP",
    MIM,
    WFTM,
    MIM,
    "MIM"
  );

  return {
    usdcPair,
    daiPair,
    fusdtPair,
    mimPair,
  };
}

async function publishMessage(inData) {
  await axios
    .post("http://127.0.0.1:7777", inData)
    .then(function (response) {
      console.log(response);
    })
    .catch(function (error) {
      console.log(error);
    });
}
