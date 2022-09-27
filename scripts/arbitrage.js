const axios = require("axios").default;
const mongoose = require("mongoose");

const { getPair, checkVerb, saveTx } = require("./utils");

const { WFTM, USDC, DAI, FUSDT, MIM } = require("./static/tokens");
const {
  usdcFtmLpContract,
  daiFtmLpContract,
  fusdtFtmLpContract,
  mimFtmLpContract,
} = require("./static/lpContracts");

console.log("Starting Arbitrage Bot");
process.env.MONGO_URI
  ? mongoose.connect(process.env.MONGO_URI).then(() => mainLoop())
  : mainLoop();
console.log("Arbitrage Bot Started");

async function mainLoop() {
  checkVerb("Comparing Stable Prices");
  const { usdcPair, daiPair, fusdtPair, mimPair } = await getLPPairs();

  await comparePrice(usdcPair, daiPair).catch(async (err) => {
    await handleError(err);
  });
  await comparePrice(usdcPair, fusdtPair).catch(async (err) => {
    await handleError(err);
  });
  await comparePrice(usdcPair, mimPair).catch(async (err) => {
    await handleError(err);
  });
  await comparePrice(daiPair, fusdtPair).catch(async (err) => {
    await handleError(err);
  });
  await comparePrice(daiPair, mimPair).catch(async (err) => {
    await handleError(err);
  });
  await comparePrice(fusdtPair, mimPair).catch(async (err) => {
    await handleError(err);
  });

  process.nextTick(mainLoop);
}

async function comparePrice(pair1, pair2) {
  checkVerb(`Comparing ${pair1.stableName} to ${pair2.stableName}`);
  const pair1USD = pair1.stablePrice * pair1.ftmPrice;
  const pair2USD = pair2.stablePrice * pair2.ftmPrice;
  const pair1Goal = pair2USD * 1.02;
  const pair2Goal = pair1USD * 1.02;
  checkVerb(`${pair1.stableName} is ${pair1USD} USD`);
  checkVerb(`${pair1.stableName} goal is ${pair1Goal} USD`);
  if (pair1USD > pair1Goal) {
    const priceDifference = pair1USD - pair2USD;
    checkVerb(
      `${pair1.stableName} is ${priceDifference} USD higher than ${pair2.stableName}`
    );
    const sell = pair1.stableName;
    const buy = pair2.stableName;
    const sellPrice = pair1USD;
    const buyPrice = pair2USD;
    const profit = sellPrice - buyPrice;
    const action = `Trade ${sell} for ${buy}`;
    checkVerb(`${action} => Profit: $${profit} per token.`);
    const date = new Date();
    const data = {
      sell,
      buy,
      flag: "normal",
      tradeAmount: -1,
    };
    await publishMessage(data).catch(async (err) => {
      await handleError(err);
    });
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
    }).catch(async (err) => {
      await handleError(err);
    });
  } else if (pair2USD > pair2Goal) {
    const priceDifference = pair2USD - pair1USD;
    checkVerb(
      `${pair2.stableName} is ${priceDifference} USD higher than ${pair1.stableName}`
    );
    const sell = pair2.stableName;
    const buy = pair1.stableName;
    const sellPrice = pair2USD;
    const buyPrice = pair1USD;
    const profit = sellPrice - buyPrice;
    const action = `Trade ${sell} for ${buy}`;
    checkVerb(`${action} => Profit: $${profit} per token.`);
    const date = new Date();
    const data = {
      sell,
      buy,
      flag: "normal",
      tradeAmount: -1,
    };
    await publishMessage(data).catch(async (err) => {
      await handleError(err);
    });
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
    }).catch(async (err) => {
      await handleError(err);
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
      checkVerb(response);
    })
    .catch(async (err) => {
      await handleError(err);
    });
}

async function handleError(message) {
  await axios
    .post("http://127.0.0.1:5544", { message })
    .then(function (response) {
      checkVerb(response);
    })
    .catch(function (error) {
      checkVerb(error);
    });
}
