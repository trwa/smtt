import {Contract} from "../framework/contract.ts";
import {getLucidInstance} from "../src/common.ts";
import {Constr, Data, fromText,} from "https://deno.land/x/lucid@0.10.7/src/mod.ts";

const lucid = await lucid();

async function getPaymentCredentialHash(): Promise<string> {
    const walletAddress = await lucid.wallet.address();
    const walletAddressDetails = lucid.utils.getAddressDetails(walletAddress);
    return walletAddressDetails.paymentCredential!.hash;
}

async function createAuction(): Promise<void> {
    const contract = new Contract(
        lucid,
        "/data/Workspace/cardamove/onchain/plutus.json",
        "examples/rosetta/auction.auction",
    );

    const paymentCredentialHash = await getPaymentCredentialHash();

    const datum = Data.to(
        new Constr(0, [
            paymentCredentialHash, // seller
            fromText("premium"), // object
            1752561490000n, // deadline
            new Constr(0, []), // NOT_STARTED status
            paymentCredentialHash, // bidder
            0n, // Starting amount
        ]),
    );

    const tx = lucid
        .newTx()
        .payToContract(contract.getAddress(), { inline: datum }, {
            lovelace: BigInt(2 * 1000000),
        }).validFrom(new Date().getTime() - 60 * 1000);

    const completedTx = await tx.complete();
    const signedTx = await completedTx.sign().complete();

    const txHash = await signedTx.submit();
    console.log("Transaction hash: ", txHash);
}

async function redeemAuctionStart(): Promise<void> {
    const contract = new Contract(
        lucid,
        "/data/Workspace/cardamove/onchain/plutus.json",
        "examples/rosetta/auction.auction",
    );

    const utxos = (await lucid.utxosAt(contract.getAddress()));
    console.log("UTXO: ", utxos);

    const utxo = utxos[3];

    const paymentCredentialHash = await getPaymentCredentialHash();

    const redeemer = Data.to(new Constr(0, [])); // start redeemer

    const datum = Data.to(
        new Constr(1, [
            paymentCredentialHash, // seller
            fromText("premium"), // object
            1752561490000n, // deadline
            new Constr(1, []), // START status
            paymentCredentialHash, // bidder
            BigInt(6 * 1000000), // Starting amount
        ]),
    );

    const tx = lucid
        .newTx()
        .collectFrom([utxo], redeemer)
        .addSigner(await lucid.wallet.address())
        .payToContract(contract.getAddress(), { inline: datum }, {
            lovelace: BigInt(2 * 1000000),
        })
        .attachSpendingValidator(contract.getScript())
        .validFrom(new Date().getTime() - 60 * 1000)
        .payToAddress(await lucid.wallet.address(), utxo.assets);

    const completedTx = await tx.complete();
    const signedTx = await completedTx.sign().complete();

    const txHash = await signedTx.submit();
    console.log("Transaction hash: ", txHash);
}

if (import.meta.main) {
    await redeemAuctionStart();
}
