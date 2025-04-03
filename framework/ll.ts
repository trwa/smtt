import {C, TxComplete, TxSigned,} from "https://deno.land/x/lucid@0.10.7/src/mod.ts";
import {Buffer} from "https://deno.land/std@0.177.0/node/buffer.ts";
import {decode} from "https://deno.land/x/cbor@v1.5.9/index.js";

export function llTxSigned(tx: TxSigned): C.Transaction {
    return tx.txSigned;
}

export function llTxComplete(tx: TxComplete): C.Transaction {
    return tx.txComplete;
}

export function llTxSignedBody(tx: TxSigned): C.TransactionBody {
    return llTxSigned(tx).body();
}

export function llTxCompleteBody(tx: TxComplete): C.TransactionBody {
    return llTxComplete(tx).body();
}

export function llTxCompleteToBytes(tx: TxComplete): Uint8Array {
    return llTxCompleteBody(tx).to_bytes();
}

export function llTxSignedToBytes(tx: TxSigned): Uint8Array {
    return llTxSignedBody(tx).to_bytes();
}

export function llTxSignedHash(tx: TxSigned): string {
    return C.hash_transaction(llTxSignedBody(tx)).to_hex();
}

export function llTxCompleteHash(tx: TxComplete): string {
    return C.hash_transaction(llTxCompleteBody(tx)).to_hex();
}

export function llBlake2b256(data: Uint8Array): Uint8Array {
    return C.hash_blake2b256(data);
}

export function llBlake2b256Hex(data: Uint8Array): string {
    return Buffer.from(llBlake2b256(data)).toString("hex");
}


/*
Possibili soluzioni:
1. Nel Datum di ogni nuovo utxo devo mettere qualcosa che attesti che ogni utxo precedente proveniva dall'address.
   Come? Semplicemente metto lo hash delle seguenti informazioni:
   1. La transactionId di ogni utxo consumato
   2. Lo scriptAddress di ogni

   Basterebbe poter

devo

*/



export function serializeTxBody(txSigned: TxSigned): string {
    const body = llTxSignedBody(txSigned);
    const hash = llTxSignedHash(txSigned);

    console.log("Tx body: ", body.to_json());
    console.log("Ts hash: ", hash);
    //console.log("TransactionBody (as Hex): ", a);

    //const base64String = Buffer.from('Hello World').toString('base64'); // Hello World
    //const utf8String = Buffer.from(base64String, 'base64').toString();

    //const b = Buffer.from(a, "hex"); //Deno.Buffer.from(a, "hex");
    //console.log("TransactionBody (as ByteArray): ", b);

    const b = llTxSignedToBytes(txSigned);
    const h = C.hash_blake2b256(b);
    console.log("Tb hash: ", Buffer.from(h).toString("hex"));

    // parse the bytes from cbor
    const s = Buffer.from(b);
    const j = decode(s);

    console.log("Tb bytes: ", j);

    //const k = C.TransactionBody.from_bytes(b);
    //console.log("TransactionBody: ", k.to_json());
    return "";
    //return k.to_json().toString();
}
