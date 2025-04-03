import {CardanoTransactionOutputReference, SimpleTrueSpend, SmttRunSpend, SmttSttMint, SmttTagMint, SmttTagSpend,} from "./simple/plutus.ts";
import {lucid} from "./config.ts";
import {fromText} from "https://deno.land/x/lucid@0.20.4/src/utils/mod.ts";
import {Data, Hasher, Script, toHex, Tx, TxComplete, TxSigned, Utxo,} from "https://deno.land/x/lucid@0.20.9/mod.ts";

class SMTT {
  private utxo: Utxo;
  private readonly sttMint: Script;
  private readonly tagMint: Script;
  private readonly tagSpend: Script;
  private contract: Script;
  private readonly runSpend: Script;

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
  }

  public async fund(): Promise<void> {
    const policy = Hasher.hashScript(this.sttMint);
    const stt = policy + fromText("stt");

    let tx: Tx = lucid.newTx()
      .attachScript(this.sttMint)
      .mint({ [stt]: 1n }, Data.void());

    tx = tx
      .collectFrom([this.utxo])
      .payTo(await lucid.wallet.address(), this.utxo.assets);

    tx = tx
      .payToContract(
        lucid.utils.scriptToAddress(this.runSpend),
        // FIXME: Encode False (or None) in the Datum
        { Inline: Data.void(), scriptRef: this.runSpend },
        { [stt]: 1n },
      );

    const complete: TxComplete = await tx.commit();
    const signed: TxSigned = await complete.sign().commit();
    const hash: string = await signed.submit();
    console.log(hash);
  }

  public async start(): Promise<void> {
    const sttPolicy = Hasher.hashScript(this.sttMint);
    const stt = sttPolicy + fromText("stt");

    const tagPolicy = Hasher.hashScript(this.tagMint);
    const lower: Uint8Array = new Uint8Array(32);
    const upper: Uint8Array = new Uint8Array(32);
    for (let i = 0; i < 32; i++) {
      lower[i] = 0x00;
      upper[i] = 0xff;
    }
    const tagLower = tagPolicy + toHex(lower);
    const tagUpper = tagPolicy + toHex(upper);

    let tx: Tx = lucid.newTx()
      .attachScript(this.tagMint)
      .mint({ [tagLower]: 1n, [tagUpper]: 1n }, Data.void());

    const addressRunSpend = lucid.utils.scriptToAddress(this.runSpend);
    tx = tx
      .collectFrom(
        await lucid.utxosAtWithUnit(addressRunSpend, stt),
        Data.void(),
      )
      .payToContract(
        addressRunSpend,
        // FIXME: Encode True (or Some(..)) in the Datum
        { Inline: Data.void(), scriptRef: this.runSpend },
        { [stt]: 1n },
      );

    tx = tx
      .payToContract(
        lucid.utils.scriptToAddress(this.tagSpend),
        // FIXME: Encode [] in the Datum
        { Inline: Data.void(), scriptRef: this.runSpend },
        { [tagLower]: 1n, [tagUpper]: 1n },
      );

    const complete: TxComplete = await tx.commit();
    const signed: TxSigned = await complete.sign().commit();
    const hash: string = await signed.submit();
    console.log(hash);
  }

  public async add(tag: string): Promise<void> {
    return;
  }
}

async function sleep(seconds: number) {
  console.log(`delay ${seconds}s...`);
  await new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

function makeContract(smttMint: Script): Script {
  return new SimpleTrueSpend(Hasher.hashScript(smttMint));
}

if (import.meta.main) {
  const utxo = (await lucid.wallet.getUtxos())[0];
  console.log(utxo);

  const process = new SMTT(utxo, makeContract, 10n);

  await process.fund();
  await sleep(120);
  await process.start();
}
