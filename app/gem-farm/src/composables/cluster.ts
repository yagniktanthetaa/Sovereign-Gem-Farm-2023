import { readonly, ref } from 'vue';
import { Commitment, Connection } from '@solana/web3.js';
import { tokenAuthFetchMiddleware } from '@strata-foundation/web3-token-auth';
import axios from 'axios';

export enum Cluster {
  // Devnet = 'devnet',
  Mainnet = 'mainnet',
  // Testnet = 'testnet',
  // Localnet = 'localnet',
}

const clusterURLMapping = {
  // devnet: process.env.VUE_APP_DEVNET_URL || 'https://api.devnet.solana.com',
  mainnet:
    process.env.VUE_APP_MAINNET_URL || 'https://solana-mainnet.g.alchemy.com/v2/1oPClixlYy018dkAWRvQ2ORci-qK4wb8',
  // testnet: process.env.VUE_APP_TESTNET_URL || 'https://api.testnet.solana.com',
  // localnet: process.env.VUE_APP_LOCALNET_URL || 'http://localhost:8899',
};
console.log("🚀 ~ clusterURLMapping", clusterURLMapping)

const cluster = ref<Cluster>(Cluster.Mainnet);

export default function useCluster() {
  const getClusterURL = (): string => clusterURLMapping[cluster.value];

  const getToken = async (): Promise<string> =>
    // @ts-ignore
    (await axios.get(process.env.VUE_APP_GENGO_AUTH)).data.access_token;

  const getConnection = (commitment?: Commitment): Connection =>
    new Connection(getClusterURL(), {
      commitment: commitment ?? 'processed',
      // fetchMiddleware: tokenAuthFetchMiddleware({
      //   // tokenExpiry: 0,
      //   getToken,
      // }),
    });

  const setCluster = (newCluster: Cluster) => {
    cluster.value = newCluster;
    // capping at 10 chars due to security (not to expose the token)
    console.log(
      `Cluster updated, now ${newCluster} (${getClusterURL().substr(0, 10)})`
    );
  };

  return {
    cluster: readonly(cluster),
    getClusterURL,
    getConnection,
    setCluster,
  };
}
