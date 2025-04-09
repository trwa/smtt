// deno-lint-ignore-file
import {
  applyParamsToScript,
  Data,
  Script,
} from "https://deno.land/x/lucid@0.20.4/mod.ts";

export type AssetName = string;
export type ByteArray = string;
export type Int = bigint;
export type ListAssetName = Array<AssetName>;
export type PolicyId = string;
export type Redeemer = Data;
export type CardanoTransactionOutputReference = {
  transactionId: ByteArray;
  outputIndex: Int;
};
export type SmttTagDatum = { pool: ListAssetName };

const definitions = {
  "AssetName": { "title": "AssetName", "dataType": "bytes" },
  "ByteArray": { "title": "ByteArray", "dataType": "bytes" },
  "Int": { "dataType": "integer" },
  "List$AssetName": {
    "dataType": "list",
    "items": { "$ref": "#/definitions/AssetName" },
  },
  "PolicyId": { "title": "PolicyId", "dataType": "bytes" },
  "Redeemer": { "title": "Redeemer", "description": "Any Plutus data." },
  "cardano/transaction/OutputReference": {
    "title": "OutputReference",
    "description":
      "An `OutputReference` is a unique reference to an output on-chain. The `output_index`\n corresponds to the position in the output list of the transaction (identified by its id)\n that produced that output",
    "anyOf": [{
      "title": "OutputReference",
      "dataType": "constructor",
      "index": 0,
      "fields": [{
        "title": "transactionId",
        "$ref": "#/definitions/ByteArray",
      }, { "title": "outputIndex", "$ref": "#/definitions/Int" }],
    }],
  },
  "smtt/TagDatum": {
    "title": "TagDatum",
    "anyOf": [{
      "title": "TagDatum",
      "dataType": "constructor",
      "index": 0,
      "fields": [{ "title": "pool", "$ref": "#/definitions/List$AssetName" }],
    }],
  },
};

export interface SmttSttMint {
  new (utxo: CardanoTransactionOutputReference): Script;
  _r: Redeemer;
}

export const SmttSttMint = Object.assign(
  function (utxo: CardanoTransactionOutputReference) {
    return {
      type: "PlutusV3",
      script: applyParamsToScript(
        [utxo],
        "59029201010032323232323232225333003323232323253330083370e900018049baa00113232533300a3370e900018059baa323300100137586004601a6ea801c894ccc03c004530103d87a800013232533300e3375e600a60206ea80080344cdd2a40006602400497ae01330040040013013002301100113232533300f301200213232323253330103370e900118089baa00413253330113370e0049001099b8f00300114a06eb8c054c048dd50020b1bad30143015002375c602600260266eb0c048c04c008c04400458dd618080009919800800991919191998021998021bac30033011375401697ae0223233001001330163374a90001980b1804980a1baa3009301437540066602c6e9cc8cc004004dd59803180a9baa00422533301700114bd70099199911191980080080191299980e80088018991980f9ba73301f375200c6603e60380026603e603a00297ae0330030033021002301f001375c602c0026eacc05c004cc00c00cc06c008c064004cc058c018c050dd5001a5eb812f5c044a66602c002200626602e603000266004004603200297ae0223300332330010013758600a60286ea800c894ccc05800452f5c026600a6602e6e9ccc05cc028c054dd50021980b980c000a5eb812f5c066004004603200200244646600200200644a66602a002200626602c602e0026600400460300024602660280024602460266026002444646600200200844a6660260022008266006602a00266004004602c00244a66601e002297ae013232533300e3371e6eb8c04cdd61809980a0010030998091ba7002330040040011330040040013013002375860220022c4601e0026eb8c034c028dd50008b1806180680118058009805801180480098029baa00114984d9595cd2ab9d5573caae7d5d02ba157441",
        {
          "shape": {
            "dataType": "list",
            "items": [{
              "$ref": "#/definitions/cardano/transaction/OutputReference",
            }],
          },
          definitions,
        } as any,
      ),
    };
  },
  { _r: { "shape": { "$ref": "#/definitions/Redeemer" }, definitions } },
) as unknown as SmttSttMint;

export interface SmttTagMint {
  new (sttMint: PolicyId): Script;
  _r: Redeemer;
}

export const SmttTagMint = Object.assign(
  function (sttMint: PolicyId) {
    return {
      type: "PlutusV3",
      script: applyParamsToScript(
        [sttMint],
        "59022101010032323232323232232253330043232323232323232323232323253330113370e9000004099198041801006919b8f375c60306eb0c060c064004044dd7180b18099baa009153330113370e90010040991919198051802007919b8f375c60346eb0c068c06c00404cc060c064008c05c004c04cdd50048b11998031998031bac30053013375400297ae0223233001001330183374a90001980c1803180b1baa300630163754006660306e9cc8cc004004dd59804180b9baa00422533301900114bd70099199911191980080080191299980f8008801899198109ba733021375200c66042603c00266042603e00297ae03300300330230023021001375c60300026eacc064004cc00c00cc074008c06c004cc060c020c058dd5001a5eb812f5c044a6660300022006266032603400266004004603600297ae0223300432330010013758600e602c6ea800c894ccc06000452f5c026600c660326e9ccc064c01cc05cdd50021980c980d000a5eb812f5c066004004603600200244646600200200644a66602c002200626602e6030002660040046032002460280024602660280024602460266026002444646600200200844a6660260022008266006602a00266004004602c00244646600200200644a66602200229404c94ccc03cc010dd6180a0010a511330030030013014001300a3754002601a601c004601800260180046014002600c6ea800452613656375c002ae6955ceaab9e5573eae815d0aba201",
        {
          "shape": {
            "dataType": "list",
            "items": [{ "$ref": "#/definitions/PolicyId" }],
          },
          definitions,
        } as any,
      ),
    };
  },
  { _r: { "shape": { "$ref": "#/definitions/Redeemer" }, definitions } },
) as unknown as SmttTagMint;

export interface SmttTagSpend {
  new (sttMint: PolicyId): Script;
  _d: SmttTagDatum;
  _r: Redeemer;
}

export const SmttTagSpend = Object.assign(
  function (sttMint: PolicyId) {
    return {
      type: "PlutusV3",
      script: applyParamsToScript(
        [sttMint],
        "59022101010032323232323232232253330043232323232323232323232323253330113370e9000004099198041801006919b8f375c60306eb0c060c064004044dd7180b18099baa009153330113370e90010040991919198051802007919b8f375c60346eb0c068c06c00404cc060c064008c05c004c04cdd50048b11998031998031bac30053013375400297ae0223233001001330183374a90001980c1803180b1baa300630163754006660306e9cc8cc004004dd59804180b9baa00422533301900114bd70099199911191980080080191299980f8008801899198109ba733021375200c66042603c00266042603e00297ae03300300330230023021001375c60300026eacc064004cc00c00cc074008c06c004cc060c020c058dd5001a5eb812f5c044a6660300022006266032603400266004004603600297ae0223300432330010013758600e602c6ea800c894ccc06000452f5c026600c660326e9ccc064c01cc05cdd50021980c980d000a5eb812f5c066004004603600200244646600200200644a66602c002200626602e6030002660040046032002460280024602660280024602460266026002444646600200200844a6660260022008266006602a00266004004602c00244646600200200644a66602200229404c94ccc03cc010dd6180a0010a511330030030013014001300a3754002601a601c004601800260180046014002600c6ea800452613656375c002ae6955ceaab9e5573eae815d0aba201",
        {
          "shape": {
            "dataType": "list",
            "items": [{ "$ref": "#/definitions/PolicyId" }],
          },
          definitions,
        } as any,
      ),
    };
  },
  { _d: { "shape": { "$ref": "#/definitions/smtt/TagDatum" }, definitions } },
  { _r: { "shape": { "$ref": "#/definitions/Redeemer" }, definitions } },
) as unknown as SmttTagSpend;
