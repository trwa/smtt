import {
  CardanoTransactionOutputReference,
  SimpleTrueSpend,
  SmttRunSpend,
  SmttSttMint,
  SmttTagMint,
  SmttTagSpend,
} from "./on-chain.old/plutus.ts";
import {lucid} from "./config.ts";
import {
  Data,
  fromText,
  Hasher,
  Script,
  toHex,
  Tx,
  TxComplete,
  TxSigned,
  Utxo,
} from "https://deno.land/x/lucid@0.20.9/mod.ts";

import {findTagSpendState, sleep, tagMake, tagNameMax, tagNameMin,} from "./utils.ts";

class SmttMake {
  private utxo: Utxo;
  private readonly sttMint: Script;
  private readonly tagMint: Script;
  private readonly tagSpend: Script;
  private contract: Script;
  private readonly runSpend: Script;
  private readonly splitThreshold: bigint;

  public constructor(
    utxo: Utxo,
    makeContract: (smttPolicy: Script) => Script,
    splitThreshold: bigint,
  ) {
    const reference: CardanoTransactionOutputReference = {
      transactionId: utxo.txHash,
      outputIndex: BigInt(utxo.outputIndex),
    };
    const sttMint = new SmttSttMint(reference);
    const sttPolicy = Hasher.hashScript(sttMint);

    const tagMint = new SmttTagMint(sttPolicy);
    const tagPolicy = Hasher.hashScript(tagMint);

    const tagSpend = new SmttTagSpend(sttPolicy);
    const tagSpendAddres = fromText(lucid.utils.scriptToAddress(tagSpend));

    const contract = makeContract(tagMint);
    const contractAddress = fromText(lucid.utils.scriptToAddress(contract));

    const runSpend = new SmttRunSpend(
      sttPolicy,
      tagPolicy,
      tagSpendAddres,
      contractAddress,
      splitThreshold,
    );

    this.utxo = utxo;
    this.sttMint = sttMint;
    this.tagMint = tagMint;
    this.tagSpend = tagSpend;
    this.contract = contract;
    this.runSpend = runSpend;
    this.splitThreshold = splitThreshold;
  }

  public async fund(): Promise<void> {
    const policy = Hasher.hashScript(this.sttMint);
    const stt = policy + Hasher.hashScript(this.runSpend);

    let tx: Tx = lucid.newTx()
      .attachScript(this.sttMint)
      .mint({ [stt]: 1n }, Data.void());

    tx = tx
      .collectFrom([this.utxo])
      .payTo(await lucid.wallet.address(), this.utxo.assets);

    tx = tx
      .payToContract(
        lucid.utils.scriptToAddress(this.runSpend),
        {
          Inline: Data.to({ started: false }, SmttRunSpend._d),
          scriptRef: this.runSpend,
        },
        { [stt]: 1n },
      );

    const complete: TxComplete = await tx.commit();
    const signed: TxSigned = await complete.sign().commit();
    const hash: string = await signed.submit();
    console.log(hash);
  }

  public async start(): Promise<void> {
    let tx: Tx = lucid.newTx()
      .attachScript(this.tagMint);
    tx = this.mintNewTag(tx, tagNameMin());
    tx = this.mintNewTag(tx, tagNameMax());
    tx = await this.propagateSttToRunSpend(tx);
    tx = this.fundPool(tx);
    await this.finishTx(tx);
  }

  public async add(tagName: Uint8Array): Promise<void> {
    const tagSpendState = await findTagSpendState(
      this.tagMint,
      this.tagSpend,
      tagName,
    );
    if (tagSpendState === null) {
      console.error("Pool not found");
      return;
    }
    console.log(tagSpendState);

    let tx: Tx = lucid.newTx();
    tx = this.mintNewTag(tx, tagName);
    // TODO: check if the pool is too big and, in case, split it
    tx = this.propagatePoolNoSplit(
      tx,
      tagSpendState.utxo,
      tagSpendState.lower,
      tagSpendState.upper,
      tagSpendState.pool,
      tagName,
    );
    tx = await this.propagateSttToRunSpend(tx);
    tx = this.sendTagToContract(tx, tagName);
    await this.finishTx(tx);
  }

  private async finishTx(tx: Tx): Promise<void> {
    const complete: TxComplete = await tx.commit();
    const signed: TxSigned = await complete.sign().commit();
    const hash: string = await signed.submit();
    console.log(hash);
  }

  private mintNewTag(tx: Tx, tagName: Uint8Array) {
    const tag = tagMake(this.tagMint, tagName);
    const redeemer = Data.void();
    return tx.mint({ [tag]: 1n }, redeemer);
  }

  private async propagateSttToRunSpend(tx: Tx) {
    const addressRunSpend = lucid.utils.scriptToAddress(this.runSpend);
    const stt = Hasher.hashScript(this.sttMint) +
      Hasher.hashScript(this.runSpend);
    const utxos = await lucid.utxosAtWithUnit(addressRunSpend, stt);
    const datum = Data.to({ started: true }, SmttRunSpend._d);
    const redeemer = Data.void();
    return tx
      .collectFrom(utxos, redeemer)
      .payToContract(
        addressRunSpend,
        { Inline: datum, scriptRef: this.runSpend },
        { [stt]: 1n },
      );
  }

  private propagatePoolNoSplit(
    tx: Tx,
    utxo: Utxo,
    lower: Uint8Array,
    upper: Uint8Array,
    pool: string[],
    tagName: Uint8Array,
  ) {
    const tagSpendAddress = lucid.utils.scriptToAddress(this.tagSpend);
    const tagPolicy = Hasher.hashScript(this.tagMint);
    const tagLower = tagPolicy + toHex(lower);
    const tagUpper = tagPolicy + toHex(upper);
    const newPool = pool.concat([toHex(tagName)]).sort((lhs, rhs) =>
      lhs.localeCompare(rhs)
    );
    const datum = Data.to({ pool: newPool }, SmttTagSpend._d);
    return tx
      .collectFrom([utxo], Data.void())
      .payToContract(
        tagSpendAddress,
        { Inline: datum, scriptRef: this.tagSpend },
        { [tagLower]: 1n, [tagUpper]: 1n },
      );
  }

  private fundPool(tx: Tx) {
    const tagSpendAddress = lucid.utils.scriptToAddress(this.tagSpend);
    const datum = Data.to({ pool: [] }, SmttTagSpend._d);
    const tagLower = tagMake(this.tagMint, tagNameMin());
    const tagUpper = tagMake(this.tagMint, tagNameMax());
    return tx
      .payToContract(tagSpendAddress, {
        Inline: datum,
        scriptRef: this.tagSpend,
      }, { [tagLower]: 1n, [tagUpper]: 1n });
  }
  private sendTagToContract(tx: Tx, tagName: Uint8Array) {
    const addressContract = lucid.utils.scriptToAddress(this.contract);
    const tag = tagMake(this.tagMint, tagName);
    const datum = Data.void();
    return tx
      .payToContract(
        addressContract,
        {
          Inline: datum,
          scriptRef: this.contract,
        },
        { [tag]: 1n },
      );
  }
}

function makeContract(smttMint: Script): Script {
  return new SimpleTrueSpend(Hasher.hashScript(smttMint));
}

if (import.meta.main) {
  const utxo = (await lucid.wallet.getUtxos())[0];
  console.log(utxo);

  const process = new SmttMake(utxo, makeContract, 1n);

  const name1 = new Uint8Array(32);
  name1[0] = 0x01;
  const name2 = new Uint8Array(32);
  name2[0] = 0x02;

  await process.fund();
  await sleep(120);
  await process.start();
  await sleep(120);
  await process.add(name1);
  await sleep(120);
  await process.add(name2);
}
