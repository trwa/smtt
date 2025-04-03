import {C, Data, Tx, TxComplete, TxSigned} from "https://deno.land/x/lucid@0.10.7/src/mod.ts";
import {getLucidInstance} from "../src/common.ts";
import {ContractDatum} from "../framework/internal/datum.ts";
import {Contract} from "../framework/contract.ts";
import {makeStartDatum, Start} from "../framework/start.ts";
import {Buffer} from "jsr:@std/io/buffer";
import {
    llBlake2b256,
    llBlake2b256Hex,
    llTxCompleteBody,
    llTxCompleteHash,
    llTxCompleteToBytes,
    llTxSignedBody,
    llTxSignedHash,
    llTxSignedToBytes,
    serializeTxBody
} from "../framework/ll.ts";

if (import.meta.main) {
    const lucid = await lucid();

    const contract = new Contract(
        lucid,
        "/data/Workspace/cardamove/onchain/plutus.json",
        "examples/simple.run",
    );

    const start = new Start(
        lucid,
        "/data/Workspace/cardamove/onchain/plutus.json",
        "framework/start.run",
        contract,
    );

   const utxos = /*await start.run([]);*/await lucid.utxosAt(contract.getAddress());

    //utxos[0].txHash;

    //console.log("Address: ", contract.getAddress());
    //console.log("Utxos: ", utxos);
    //console.log("Datum: ", Data.from<typeof ContractDatum>(utxos[0].datum!));

    //console.log("Address: ", start.getAddress());

    // Build the transaction
    const tx: Tx = lucid
        .newTx()
        .collectFrom(utxos)
        .payToContract(contract.getAddress(), {
            inline: makeStartDatum([]),
            scriptRef: start.getScript(),
        }, {
            lovelace: 100n,
        });

    // Complete the transaction
    const completedTx: TxComplete = await tx
        .complete();

    console.log("======================================================================================");
    console.log(llTxCompleteBody(completedTx).to_json());
    console.log("======================================================================================");


    // Sign the transaction
    const signedTx: TxSigned = await completedTx
        .sign()
        .complete();

    console.log("======================================================================================");
    console.log(llTxSignedBody(signedTx).inputs().to_json());
    console.log("======================================================================================");

    //console.log("Tx body (json): ", await serializeTxBody(tx));
    // serializeTxBody(signedTx);

    console.log("======================================================================================");
    console.log(llTxCompleteHash(completedTx));
    console.log(llTxSignedHash(signedTx));
    console.log("======================================================================================");

    console.log("======================================================================================");
    console.log(llBlake2b256Hex(llTxCompleteToBytes(completedTx)));
    console.log(llBlake2b256Hex(llTxSignedToBytes(signedTx)));
    console.log("======================================================================================");

    // Submit the transaction
    const txHash = await signedTx
        .submit();

    console.log("======================================================================================");
    console.log(txHash);
    console.log("======================================================================================");

    //console.log("Tx hash: ", txHash);

    //console.log("Utxos: ", utxos);
}
