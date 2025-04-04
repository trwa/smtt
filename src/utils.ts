import {Data, Hasher, Script, toHex, Utxo,} from "https://deno.land/x/lucid@0.20.9/mod.ts";
import {lucid} from "./config.ts";
import {SmttTagSpend} from "./smtt/plutus.ts";

export function tagNameMin(): Uint8Array {
  const lower: Uint8Array = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    lower[i] = 0x00;
  }
  return lower;
}

export function tagNameMax(): Uint8Array {
  const upper: Uint8Array = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    upper[i] = 0xff;
  }
  return upper;
}

export function tagMake(policy: Script, name: Uint8Array): string {
  const policyId = Hasher.hashScript(policy);
  return policyId + toHex(name);
}

export function array32ToBigInt(array: Uint8Array): bigint {
  let hexString = "0x";
  for (const byte of array) {
    hexString += byte.toString(16).padStart(2, "0");
  }
  return BigInt(hexString);
}

export function bigIntToArray32(value: bigint): Uint8Array {
  const hexString = value.toString(16).padStart(64, "0");
  const array = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    array[i] = parseInt(hexString.slice(i * 2, i * 2 + 2), 16);
  }
  return array;
}

export async function findTagSpendState(
  tagMint: Script,
  tagSpend: Script,
  tag: Uint8Array,
): Promise<
  {
    utxo: Utxo;
    lower: Uint8Array;
    upper: Uint8Array;
    pool: string[];
  } | null
> {
  const spendAddress = lucid.utils.scriptToAddress(tagSpend);
  let lower = tagNameMin();
  let upper = tagNameMax();
  while (true) {
    if (lower === upper) {
      return null;
    }

    const lowerTag = tagMake(tagMint, lower);
    const upperTag = tagMake(tagMint, upper);

    const utxoLower = (await lucid.utxosAtWithUnit(spendAddress, lowerTag))
      .at(0);
    const utxoUpper = (await lucid.utxosAtWithUnit(spendAddress, upperTag))
      .at(0);

    if (utxoLower?.outputIndex === utxoUpper?.outputIndex) {
      return {
        utxo: utxoLower,
        lower: lower,
        upper: upper,
        pool: Data.from(utxoLower.datum, SmttTagSpend._d).pool,
      };
    }

    const p = (array32ToBigInt(lower) + array32ToBigInt(upper)) / 2n;
    if (array32ToBigInt(tag) <= p) {
      upper = bigIntToArray32(p);
    } else {
      lower = bigIntToArray32(p + 1n);
    }
  }
}

function splitBounds(lower: Uint8Array, upper: Uint8Array): {
  lower: Uint8Array;
  middle: Uint8Array;
  upper: Uint8Array;
} {
  const p = (array32ToBigInt(lower) + array32ToBigInt(upper)) / 2n;
  return {
    lower: lower,
    middle: bigIntToArray32(p),
    upper: upper,
  };
}

export async function sleep(seconds: number) {
  console.log(`Sleep ${seconds}s...`);
  await new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}
