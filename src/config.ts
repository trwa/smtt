import * as dotenv from "npm:dotenv";
import * as process from "node:process";
import {Blockfrost, Lucid, Provider,} from "https://deno.land/x/lucid@0.20.9/mod.ts";

dotenv.config();

const BLOCKFROST_API_KEY = process.env.BLOCKFROST_API_KEY as string;
const SEED = (process.env.SEED as string).split(" ");
//const ADDRESS = process.env.ADDRESS as string;

const provider: Provider = new Blockfrost(
  "https://cardano-preprod.blockfrost.io/api/v0",
  BLOCKFROST_API_KEY,
);
export const lucid: Lucid = new Lucid({
  provider: provider,
  network: "Preprod",
})
  .selectWalletFromSeed(SEED.join(" "), { index: 0 });
