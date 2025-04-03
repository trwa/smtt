import {getLucidInstance} from "./src/common.ts";
import {Contract} from "./framework/contract.ts";
import {Constr, Data, fromText, Lucid,} from "https://deno.land/x/lucid@0.10.7/src/mod.ts";

function emptyDatum(address: string): string {
    return Data.to(
        new Constr(0, [
            // address
            fromText(address),

            // data
            new Constr(0, []),
        ]),
    );
}

function emptyRedeemer(): string {
    return Data.to(
        new Constr(0, [new Constr(0, [])]),
    );
}

async function fundSimple(lucid: Lucid, contract: Contract) {
    return (
        await (
            await lucid
                .newTx()
                // 1st UTxO
                .payToContract(contract.getAddress(), {
                    inline: emptyDatum("12345678"),
                }, {
                    lovelace: 100n * 1000000n,
                })
                // 2nd UTxO
                //.payToContract(contract.getAddress(), {
                //    inline: emptyDatum("987654321"),
                //}, {
                //    lovelace: 2n * 1000000n,
                //})
                .complete()
        ).sign().complete()
    ).submit();
}

async function spendCorrect2UTxO(lucid: Lucid, contract: Contract) {
    const utxos = await lucid.utxosAt(contract.getAddress());

    return (
        await lucid
            .newTx()
            .collectFrom(utxos, emptyRedeemer())

            .addSigner(await lucid.wallet.address())
            // 1st UTxO
            .payToContract(contract.getAddress(), {
                inline: emptyDatum("12345678"),
            }, {
                lovelace: 1000n * 1000000n,
            })
            // 2nd UTxO
            .payToContract(contract.getAddress(), {
                inline: emptyDatum("987654321"),
            }, {
                lovelace: 1000n * 1000000n,
            })
            .attachSpendingValidator(contract.getScript())
            //.payToAddress(await lucid.wallet.address(), {lovelace: 1_000_000n})
            .complete()
    );
}

if (import.meta.main) {
    const lucid = await getLucidInstance();

    const contract = new Contract(
        lucid,
        "/data/Workspace/cardamove/onchain/plutus.json",
        "examples/auction.run",
    );

    const utxos = await lucid.utxosAt(
        contract.getAddress(),
    );

    console.log("Contract address: ", contract.getAddress());
    console.log("Contract utxos: ", utxos);

    //console.log(await fundSimple(lucid, contract));

    const tx = await spendCorrect2UTxO(lucid, contract);
    console.log("Fee: ", tx.fee);
    //const hash = await (await tx.sign().complete()).submit();
    //console.log(hash);
}
