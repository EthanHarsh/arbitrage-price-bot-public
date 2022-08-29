const mongoose = require("mongoose");
const transactionSchema = new mongoose.Schema({
  action: String,
  sell: String,
  buy: String,
  profit: Number,
  sellPrice: Number,
  buyPrice: Number,
  time: Number,
  humanTime: String,
  exchange: String,
});

const TxModel = mongoose.model("transaction", transactionSchema);

const saveTx = async (tx) => {
  const transaction = new TxModel(tx);
  const savedTx = await transaction.save();
  return savedTx;
};

module.exports = saveTx;
