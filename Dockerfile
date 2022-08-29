FROM node:16-bullseye
COPY . /app
WORKDIR ./app
RUN npm install
CMD npx hardhat run --network fantom scripts/arbitrage.js