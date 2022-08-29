const { Token } = require("@uniswap/sdk");

const CHAINID = 250;

const wftm = {
  address: "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83",
  decimals: 18,
};
const WFTM = new Token(CHAINID, wftm.address, wftm.decimals);

const usdc = {
  address: "0x04068DA6C83AFCFA0e13ba15A6696662335D5B75",
  decimals: 6,
};
const USDC = new Token(CHAINID, usdc.address, usdc.decimals);

const dai = {
  address: "0x8D11eC38a3EB5E956B052f67Da8Bdc9bef8Abf3E",
  decimals: 18,
};
const DAI = new Token(CHAINID, dai.address, dai.decimals);

const fusdt = {
  address: "0x049d68029688eAbF473097a2fC38ef61633A3C7A",
  decimals: 6,
};

const FUSDT = new Token(CHAINID, fusdt.address, fusdt.decimals);

const mim = {
  address: "0x82f0B8B456c1A451378467398982d4834b6829c1",
  decimals: 18,
};

const MIM = new Token(CHAINID, mim.address, mim.decimals);

module.exports = {
  WFTM,
  USDC,
  DAI,
  FUSDT,
  MIM,
};
