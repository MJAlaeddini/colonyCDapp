const {
  getTokenClient,
  getColonyNetworkClient,
  Network,
} = require('@colony/colony-js');
const {
  providers,
  utils: { Logger },
  constants,
} = require('ethers');

Logger.setLogLevel(Logger.levels.ERROR);

let rpcURL = 'http://network-contracts.docker:8545'; // this needs to be extended to all supported networks
let network = Network.Custom;
let networkAddress;

const setEnvVariables = async () => {
  const ENV = process.env.ENV;
  if (ENV === 'qa') {
    const { getParams } = require('/opt/nodejs/getParams');
    [rpcURL, networkAddress, network] = await getParams([
      'chainRpcEndpoint',
      'networkContractAddress',
      'chainNetwork',
    ]);
  } else {
    const {
      etherRouterAddress,
    } = require('../../../../mock-data/colonyNetworkArtifacts/etherrouter-address.json');
    networkAddress = etherRouterAddress;
  }
};

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
(
  exports.handler = async (event) => {
    try {
      await setEnvVariables();
    } catch (e) {
      throw new Error('Unable to set env variables. Reason:', e);
    }

    const { walletAddress, tokenAddress } = event.arguments?.input || {};
    const provider = new providers.JsonRpcProvider(rpcURL);

    if (tokenAddress === constants.AddressZero) {
      // Get chain native token balance
      try {
        const balance = await provider.getBalance(walletAddress);
        return {
          balance: balance.toString(),
        };
      } catch {
        console.error('Could not get native token balance');
        return null;
      }
    }

    try {
      // Get token balance
      const tokenClient = await getTokenClient(tokenAddress, provider);

      const networkClient = getColonyNetworkClient(network, provider, {
        networkAddress,
      });

      const tokenLockingClient = await networkClient.getTokenLockingClient();
      const userLock = await tokenLockingClient.getUserLock(
        tokenAddress,
        walletAddress,
      );

      /** @TODO Get staked tokens from voting rep client */
      const stakedTokens = 0;
      const totalObligation = await tokenLockingClient.getTotalObligation(
        walletAddress,
        tokenAddress,
      );

      const inactiveBalance = await tokenClient.balanceOf(walletAddress);
      const lockedBalance = totalObligation.add(stakedTokens);
      const activeBalance = userLock.balance.sub(totalObligation);
      const totalBalance = inactiveBalance
        .add(lockedBalance)
        .add(activeBalance);

      return {
        balance: totalBalance.toString(),
        inactiveBalance: inactiveBalance.toString(),
        lockedBalance: lockedBalance.toString(),
        activeBalance: activeBalance.toString(),
        pendingBalance: userLock.pendingBalance.toString(),
      };
    } catch {
      console.error('Could not get token balance');
      return null;
    }
  }
);
