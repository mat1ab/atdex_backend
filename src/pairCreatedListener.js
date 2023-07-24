const ethers = require('ethers');
const AWS = require('aws-sdk');

const PROJ_ROOT = process.env.PROJ_ROOT;
const factoryAbi = require(`${PROJ_ROOT}/src/abis/factory_abi.json`);
const config = require(`${PROJ_ROOT}/src/config/config.json`);
const factoryAddress = config.factoryAddress;

AWS.config.update({
    region: config.awsRegion,
});

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function handlePairCreatedEvent(token0, token1, pairAddress, event, provider) {
    console.log('PairCreated event detected:');
    console.log(`- token0: ${token0}`);
    console.log(`- token1: ${token1}`);
    console.log(`- pairAddress: ${pairAddress}`);
    console.log(`Event object: ${ethers.utils.formatEther(event)}`);

    const balance = await provider.getBalance(pairAddress);


    console.log(`Balance of pairAddress: ${ethers.utils.formatEther(balance)}`); // Balance in Ether

    const params = {
        TableName: 'TokenPairs',
        Item: {
            token0: token0,
            token1: token1,
            pairAddress: pairAddress
        }
    };

    try {
        await dynamodb.put(params).promise();
        console.log("Added item successfully.");
    } catch (err) {
        console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
    }
   
}

let eventQueue = [];

async function start(provider) {
  let factory = new ethers.Contract(factoryAddress, factoryAbi, provider);
  factory.on("PairCreated", async (token0, token1, pairAddress, event) => {
    eventQueue.push({ token0, token1, pairAddress, event });
  });

  setInterval(async () => {
    let tempQueue = [...eventQueue];
    eventQueue = [];
    for (let event of tempQueue) {
      await handlePairCreatedEvent(event.token0, event.token1, event.pairAddress, event.event, provider);
    }
  }, 60000);
}


module.exports = {
    start
};
