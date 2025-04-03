import {CardanoTransactionOutputReference, SimpleTrueSpend, SmttRunSpend, SmttSttMint, SmttTagMint, SmttTagSpend,} from "./simple/plutus.ts";
import {lucid} from "./config.ts";
import {fromText} from "https://deno.land/x/lucid@0.20.4/src/utils/mod.ts";
import {Data, Hasher, Script, Tx, TxComplete, TxSigned, Utxo,} from "https://deno.land/x/lucid@0.20.9/mod.ts";

class Process {
  private utxo: Utxo;
  private readonly sttMint: Script;
  private tagMint: Script;
  private tagSpend: Script;
  private contract: Script;
  private readonly runSpend: Script;

  public constructor(
    utxo: Utxo,
    v: (policy: Script) => Script,
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

    const contract = v(tagMint);
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

  public async start(): Promise<void> {
    const policy = Hasher.hashScript(this.sttMint);
    const address = lucid.utils.scriptToAddress(this.runSpend);
    const stt = policy + fromText("stt");

    let tx: Tx = lucid.newTx()
      .attachScript(this.sttMint)
      .mint({ [stt]: 1n }, Data.void());

    tx = tx
      .collectFrom([this.utxo])
      .payTo(await lucid.wallet.address(), this.utxo.assets);

    tx = tx
      .payToContract(
        address,
        { Inline: Data.void(), scriptRef: this.runSpend },
        { [stt]: 1n },
      );

    const complete: TxComplete = await tx.commit();
    const signed: TxSigned = await complete.sign().commit();
    const hash: string = await signed.submit();
    console.log(hash);
  }
}

if (import.meta.main) {
  const utxo = (await lucid.wallet.getUtxos())[0];
  console.log(utxo);

  const mint = new Process(
    utxo,
    (policy: Script) => new SimpleTrueSpend(Hasher.hashScript(policy)),
    10n,
  );
  await mint.start();
}
