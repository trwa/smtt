import {getLucidInstance, serializeDatum, stringToHex} from "./common.ts";
import {BenchmarkLocalSpend, BenchmarkStorage, BenchmarkTokenMint, ByteArray,} from "../../../benchmark/plutus.ts";
import {Data, Lucid, Script} from "https://deno.land/x/lucid@0.20.4/mod.ts";
import {parse, stringify} from "jsr:@std/csv";
import {fromText, Hasher} from "https://deno.land/x/lucid@0.20.4/src/mod.ts";

function makeAsset(policy: Script, name: string, amount: bigint) {
  const policyId = Hasher.hashScript(policy);
  const unit = policyId + fromText(name);
  return { [unit]: amount };
}

export async function waitSeconds(seconds: number) {
  console.log(`delay ${seconds}s...`);
  await new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

export function makeRandomId(): string {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < 32) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

export function makeKey32(i: number): string {
  let s = i.toString(16);
  while (s.length < 32) {
    s = "0" + s;
  }
  return s;
}

export function makeStorage(size: number): BenchmarkStorage {
  const pairs = new Map<ByteArray, ByteArray>();
  for (let i = 0; i < size; i++) {
    pairs.set(stringToHex(makeKey32(i)), stringToHex(""));
  }
  return { pairs: pairs };
}

async function txFund(lucid: Lucid, script: Script, datum: string) {
  const policy = new BenchmarkTokenMint();
  const asset = makeAsset(policy, makeKey32(0), 1n);
  const address = lucid.utils.scriptToAddress(script);
  const tx = lucid.newTx().payToContract(
    address,
    { Inline: datum, scriptRef: script },
    asset,
  );
  const txComplete = await tx.commit();
  const txSigned = await txComplete.sign().commit();
  return await txSigned.submit();
}

async function txRun(
  lucid: Lucid,
  script: Script,
  datum: string,
) {
  const policy = new BenchmarkTokenMint();
  const asset = makeAsset(policy, makeKey32(0), 1n);
  const redeemer = Data.void();
  const address = lucid.utils.scriptToAddress(script);
  const utxos = await lucid.utxosAt(address);
  console.log("n.utxo ", utxos.length);
  if (utxos.length === 0) {
    throw new Error("no utxo");
  }
  const tx = lucid.newTx()
    .collectFrom([utxos[0]], redeemer)
    .payToContract(
      address,
      { Inline: datum, scriptRef: script },
      asset,
    );
  const txComplete = await tx.commit();
  const txSigned = await txComplete.sign().commit();
  return await txSigned.submit();
}

async function fundSingle(
  lucid: Lucid,
  id: string,
  size: number,
) {
  const policy = new BenchmarkTokenMint();
  const policyId = Hasher.hashScript(policy);
  const script = new BenchmarkLocalSpend(
    stringToHex(id),
    policyId,
    BigInt(size),
    1n,
  );
  const storage = makeStorage(size);
  const datum = serializeDatum(storage, BenchmarkLocalSpend.datum);
  return await txFund(lucid, script, datum);
}

async function runSingle(
  lucid: Lucid,
  id: string,
  size: number,
) {
  const policy = new BenchmarkTokenMint();
  const policyId = Hasher.hashScript(policy);
  const script = new BenchmarkLocalSpend(
    stringToHex(id),
    policyId,
    BigInt(size),
    1n,
  );
  const storage = makeStorage(size);
  const datum = serializeDatum(storage, BenchmarkLocalSpend.datum);
  return await txRun(lucid, script, datum);
}

const text = `
id,size,hash
PKTqNrZP9ahUzpbnKVuSr6nckEd1gz5n,1,9d43193f1fa357532a71e2c03387ddb06d2ce6e5177cee0268c793e15c12e91f
PKTqNrZP9ahUzpbnKVuSr6nckEd1gz5n,2,dc860b3a60e33d3d3ecd7150cc004a70e1933fc6ca547695747c6b8432634048
PKTqNrZP9ahUzpbnKVuSr6nckEd1gz5n,3,b70a85e1e2155b2878596bf3249dad0cb7709b6e35d21ecfbbc9e693b1733e56
PKTqNrZP9ahUzpbnKVuSr6nckEd1gz5n,4,540d8af9402e782ba3f3f0e97233458a2236a00eb77a952480026166717cfac5
PKTqNrZP9ahUzpbnKVuSr6nckEd1gz5n,5,61bbd3e2fe0bf3bf8103b5aaf3d74366b51da4913f1d12337ffaa39ece5bcef6
PKTqNrZP9ahUzpbnKVuSr6nckEd1gz5n,6,f8ee1d5dd0074f59ae707557033671b825c20e4d5d41bbd6ca4ef82a41a90d8e
PKTqNrZP9ahUzpbnKVuSr6nckEd1gz5n,7,d8b21231aa161271a0082b7583f4da30b4d381c77981f6aeb5533b0c6730e27e
PKTqNrZP9ahUzpbnKVuSr6nckEd1gz5n,8,5cf7f463a66091721e4305eb655dd47726dd1e728281c9a089ca45b2007e3aea
PKTqNrZP9ahUzpbnKVuSr6nckEd1gz5n,9,c1f133451d373c691544171ad7e1e08ebac4db901ff48762e56d4371d2ee6981
`;

if (import.meta.main) {
  const lucid = getLucidInstance();
  const id = makeRandomId();
  const delay = 60;

  //const ns = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
  //const cs = [1, 5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

  const fundings = parse(text, {
    columns: ["id", "size", "hash"],
    skipFirstRow: true,
  });
  console.log(fundings);
  const transactions: Array<{ id: string; size: number; hash: string }> = [];

  let i = 0;
  while (i < fundings.length) {
    try {
      const id = fundings[i].id;
      const size = parseInt(fundings[i].size);
      //const size = i;
      //const hash = await fundSingle(lucid, id, size);
      const hash = await runSingle(lucid, id, size);
      console.log(`[size ${size}] run`);
      transactions.push({ id: id, size: size, hash: hash });
      i += 1;
      await waitSeconds(delay);
    } catch (_) {
      console.error("retrying...");
      await waitSeconds(delay);
    }
  }

  const csv = stringify(transactions, {
    columns: [
      "id",
      "size",
      "hash",
    ],
  });
  console.log(csv);
}
