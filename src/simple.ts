import {Data} from "https://deno.land/x/lucid@0.20.9/lib/mod.ts";
import {lucid} from "./config.ts";

import {SimpleTrueSpend} from "./simple/plutus.ts";
import {Tx, TxComplete, TxSigned,} from "https://deno.land/x/lucid@0.20.9/lib/lucid/mod.ts";

async function fund() {
  const script = new SimpleTrueSpend();
  const address = lucid.utils.scriptToAddress(script);
  const datum = Data.to(undefined, SimpleTrueSpend._d);
  const tx: Tx = lucid.newTx()
    .payToContract(
      address,
      { Inline: datum, scriptRef: script },
      { lovelace: 10000000n },
    );

  const complete: TxComplete = await tx.commit();
  const signed: TxSigned = await complete.sign().commit();
  const hash: string = await signed.submit();
  console.log(hash);
}

async function spend() {
  const script = new SimpleTrueSpend();
  const address = lucid.utils.scriptToAddress(script);
  const datum = Data.to(undefined, SimpleTrueSpend._d);
  const redeemer = Data.to(undefined, SimpleTrueSpend._r);
  const utxos = await lucid.utxosAt(address);

  const tx: Tx = lucid.newTx()
    .collectFrom(utxos, redeemer)
    .payToContract(
      address,
      { Inline: datum, scriptRef: script },
      { lovelace: 10000000n },
    );

  const complete: TxComplete = await tx.commit();
  const signed: TxSigned = await complete.sign().commit();
  const hash: string = await signed.submit();
  console.log(hash);
}

if (import.meta.main) {
  await spend();
}
