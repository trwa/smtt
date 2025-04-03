import {lucid} from "./config.ts";

if (import.meta.main) {
  const address = await lucid.wallet.address();
  const utxos = await lucid.utxosAt(address);

  console.log("Wallet address: ", address);
  console.log("Wallet utxos: ", utxos);
}
