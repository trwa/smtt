import * as dotenv from "dotenv";
import {BlockfrostProvider, MeshWallet} from "@meshsdk/core";

dotenv.config();

const BLOCKFROST_API_KEY = process.env.BLOCKFROST_API_KEY as string;
const SEED = (process.env.SEED as string).split(" ");
const ADDRESS = process.env.ADDRESS as string;

export const Provider = new BlockfrostProvider(BLOCKFROST_API_KEY);
export const Wallet = new MeshWallet({
  networkId: 0, // 0: testnet, 1: mainnet
  fetcher: Provider,
  submitter: Provider,
  key: {
    type: 'mnemonic',
    words: SEED,
  },
});
