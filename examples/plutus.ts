// deno-lint-ignore-file
import {
  applyParamsToScript,
  Data,
  Script,
} from "https://deno.land/x/lucid@0.20.4/mod.ts";

export type ByteArray = string;
export type Int = bigint;
export type PairsByteArrayByteArray = Map<ByteArray, ByteArray>;
export type PolicyId = string;
export type BenchmarkEmpty = undefined;
export type BenchmarkStorage = { pairs: PairsByteArrayByteArray };

const definitions = {
  "ByteArray": { "dataType": "bytes" },
  "Int": { "dataType": "integer" },
  "Pairs$ByteArray_ByteArray": {
    "title": "Pairs<ByteArray, ByteArray>",
    "dataType": "map",
    "keys": { "$ref": "#/definitions/ByteArray" },
    "values": { "$ref": "#/definitions/ByteArray" },
  },
  "PolicyId": { "title": "PolicyId", "dataType": "bytes" },
  "benchmark/Empty": {
    "title": "Empty",
    "anyOf": [{
      "title": "Empty",
      "dataType": "constructor",
      "index": 0,
      "fields": [],
    }],
  },
  "benchmark/Storage": {
    "title": "Storage",
    "anyOf": [{
      "title": "Storage",
      "dataType": "constructor",
      "index": 0,
      "fields": [{
        "title": "pairs",
        "$ref": "#/definitions/Pairs$ByteArray_ByteArray",
      }],
    }],
  },
};

export interface BenchmarkGlobalSpend {
  new (_id: ByteArray, tagPolicy: PolicyId, _c: Int, _n: Int): Script;
  _datum: BenchmarkStorage;
  _redeemer: BenchmarkEmpty;
}

export const BenchmarkGlobalSpend = Object.assign(
  function (_id: ByteArray, tagPolicy: PolicyId, _c: Int, _n: Int) {
    return {
      type: "PlutusV3",
      script: applyParamsToScript(
        [_id, tagPolicy, _c, _n],
        "59020c010100222229800aba2aba1aba0aab9faab9eaab9dab9a9bae0059bae0049bad0039bad0024888888888896600264653001300c00198061806800cdc3a4005300c0024888966002600460186ea800e2653001301100198089809000cdc3a40009112cc004c004c040dd5004456600260226ea802226464b30013003301237540031332232598009803180a9baa00189919192cc004c024c060dd5000c4c966002601460326ea800626464944cc0140108c966002602460386ea80062942266e3cdd71810180e9baa001003406c601060386ea8c024c070dd50009bae301d301a3754003164060600a60326ea8c018c064dd5180e180c9baa0018b202e3300700100a332233003002232598009808180d1baa0018a50899b8f375c603c60366ea800400d0191803180d1baa3007301a37540026eb0c068c05cdd50059bae301a3017375400444646600200200644b30010018a5eb8226644b3001300500289980f00119802002000c4cc01001000501a180e800980f000a0368b20283001301537546004602a6ea8c060c054dd50019180b980c0009180b980c180c180c000c59011198009bac30153012375400c00844646600200200644b30010018a60103d87a80008992cc004cdd7980c980b1baa001004899ba548000cc0600052f5c1133003003301a0024050603000280b22c80922c8078601a6ea800e2c80586018002600e6ea803229344d9590051",
        {
          "shape": {
            "dataType": "list",
            "items": [
              { "$ref": "#/definitions/ByteArray" },
              { "$ref": "#/definitions/PolicyId" },
              { "$ref": "#/definitions/Int" },
              { "$ref": "#/definitions/Int" },
            ],
          },
          definitions,
        } as any,
      ),
    };
  },
  {
    _datum: {
      "shape": { "$ref": "#/definitions/benchmark/Storage" },
      definitions,
    },
  },
  {
    _redeemer: {
      "shape": { "$ref": "#/definitions/benchmark/Empty" },
      definitions,
    },
  },
) as unknown as BenchmarkGlobalSpend;

export interface BenchmarkLocalSpend {
  new (
    _id: ByteArray,
    tagPolicy: PolicyId,
    _chunkSize: Int,
    _numChunks: Int,
  ): Script;
  datum: BenchmarkStorage;
  _redeemer: BenchmarkEmpty;
}

export const BenchmarkLocalSpend = Object.assign(
  function (
    _id: ByteArray,
    tagPolicy: PolicyId,
    _chunkSize: Int,
    _numChunks: Int,
  ) {
    return {
      type: "PlutusV3",
      script: applyParamsToScript(
        [_id, tagPolicy, _chunkSize, _numChunks],
        "5903a7010100222229800aba2aba1aba0aab9faab9eaab9dab9a9bae0059bae0049bad0039bad0024888888888896600264653001300c00198061806800cdc3a4005300c0024888966002600460186ea800e2653001301100198089809000cdc3a40009112cc004c004c040dd5004456600260226ea802226464b30013003301237540031323322332259800998011801980c1baa001014899192cc004c028c064dd5000c56600264660020026466446600400400244b30010018a5eb8226644b30013259800980b18101baa0018a50899b8f375c604860426ea800401901f180418101baa00289981100119802002000c4cc01001000501e18108009811000a03e3758603e6040604060386ea8040dd7180f180d9baa0022259800800c528c5660026600c603e00203113300200230200018a50406880ea2b3001300a301937540171324a264660020026eacc078c06cdd5180f180d9baa00c2259800800c52f5bded8c1132332232330010013300600630240052259800800c4cc08ccdd81ba9004375200697adef6c608994c004dd71810800cdd71811000cc0980092225980099b9000800389981399bb037520106ea401c0162b30013371e010007133027337606ea4020dd4803800c4cc09ccdd81ba900337520046600c00c00281190230c0900050221bae301c001375c603a002603e00280ea2c80c22c80c22c80c0c004c064dd51802180c9baa0022301c301d301d301d0018b202c22323259800980f000c4c966002601660346ea80062b30013010375a603c60366ea800629462c80ca2c80c8c8c8cc004004010896600200314c0103d87a8000899192cc004cdc8802800c56600266e3c0140062601c66042603e00497ae08a60103d87a80004075133004004302300340746eb8c074004c08000501e1bae301d0018b2036300500132598009807180c1baa0018a5eb7bdb18226eacc070c064dd5000a02e32330010013756600860326ea800c896600200314c0103d87a8000899192cc004cdc8802800c56600266e3c014006260166603c603800497ae08a60103d87a80004069133004004302000340686eb8c068004c07400501b180c980b1baa00430010012301830190012259800800c52f5c113301730143018001330020023019001405916404464660020026eb0c058c04cdd5003912cc0040062980103d87a80008992cc004cdd7980c180a9baa001007898021980b800a5eb8226600600660320048098c05c0050151ba5480022c80922c8078601a6ea800e2c80586018002600e6ea803229344d95900501",
        {
          "shape": {
            "dataType": "list",
            "items": [
              { "$ref": "#/definitions/ByteArray" },
              { "$ref": "#/definitions/PolicyId" },
              { "$ref": "#/definitions/Int" },
              { "$ref": "#/definitions/Int" },
            ],
          },
          definitions,
        } as any,
      ),
    };
  },
  {
    datum: {
      "shape": { "$ref": "#/definitions/benchmark/Storage" },
      definitions,
    },
  },
  {
    _redeemer: {
      "shape": { "$ref": "#/definitions/benchmark/Empty" },
      definitions,
    },
  },
) as unknown as BenchmarkLocalSpend;

export interface BenchmarkTokenMint {
  new (): Script;
  _redeemer: BenchmarkEmpty;
}

export const BenchmarkTokenMint = Object.assign(
  function () {
    return {
      type: "PlutusV3",
      script:
        "587301010029800aba2aba1aab9faab9eaab9dab9a48888896600264653001300700198039804000cc01c0092225980099b8748000c01cdd500144c96600266e1d20003008375400915980098049baa0048a518b20148b200e375c601460106ea800a2c8030600e00260066ea801e29344d9590011",
    };
  },
  {
    _redeemer: {
      "shape": { "$ref": "#/definitions/benchmark/Empty" },
      definitions,
    },
  },
) as unknown as BenchmarkTokenMint;
