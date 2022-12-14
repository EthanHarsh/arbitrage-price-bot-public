const { TokenAmount, Pair, Route } = require("@uniswap/sdk");
const checkVerb = require("./checkVerb");

module.exports = getPair;

async function getPair(contract, lpName, token1, token2, outToken, stableName) {
  // Add error handling
  const reserves = await contract.getReserves();
  const pair = new Pair(
    new TokenAmount(token1, reserves[0]),
    new TokenAmount(token2, reserves[1])
  );
  const route = new Route([pair], outToken);
  const ftmPrice = route.midPrice.toSignificant(6);
  const stablePrice = route.midPrice.invert().toSignificant(6);
  checkVerb(
    `${lpName} => ${stableName} Price: $${ftmPrice * stablePrice} per token.`
  );

  return {
    ftmPrice,
    stablePrice,
    stableName,
    pair,
    route,
  };
}
