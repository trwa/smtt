import {Wallet} from './config';
import buildOutput from "../../src/simple/plutus.json";
import {Data, PlutusScript, resolvePlutusScriptAddress, Transaction} from "@meshsdk/core";

const scriptCbor = buildOutput.validators[0].compiledCode;

const script: PlutusScript = {
  code: scriptCbor,
  version: 'V3',
};

const scriptAddress = resolvePlutusScriptAddress(script, 0);
console.log(scriptAddress);

async function main() {
  const addr = Wallet.getUsedAddress();

  const datum: Data = {
    alternative: 0,
    fields: [],
  };

  const tx = new Transaction({initiator: Wallet})
    .sendLovelace(
      {
        address: scriptAddress,
        datum: {
          value: datum,
        },
      },
      "1000000",
    );
  const unsignedTx = await tx.build();
  const signedTx = Wallet.signTx(unsignedTx, true);
  return await Wallet.submitTx(signedTx);
}

main()
  .then((a) => {
    console.log(a);
  })
  .catch((err) => {
    console.error(err);
  });
