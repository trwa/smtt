// deno-lint-ignore-file
import {
  applyParamsToScript,
  Data,
  Script,
} from "https://deno.land/x/lucid@0.20.4/mod.ts";

export type Bool = boolean;
export type ByteArray = string;
export type Int = bigint;
export type ListByteArray = Array<ByteArray>;
export type PolicyId = string;
export type ScriptHash = string;
export type Void = undefined;
export type CardanoTransactionOutputReference = {
  transactionId: ByteArray;
  outputIndex: Int;
};
export type SmttRunDatum = { started: Bool };
export type SmttTagDatum = { pool: ListByteArray };

const definitions = {
  "Bool": {
    "title": "Bool",
    "anyOf": [{
      "title": "False",
      "dataType": "constructor",
      "index": 0,
      "fields": [],
    }, {
      "title": "True",
      "dataType": "constructor",
      "index": 1,
      "fields": [],
    }],
  },
  "ByteArray": { "dataType": "bytes" },
  "Int": { "dataType": "integer" },
  "List$ByteArray": {
    "dataType": "list",
    "items": { "$ref": "#/definitions/ByteArray" },
  },
  "PolicyId": { "title": "PolicyId", "dataType": "bytes" },
  "ScriptHash": { "title": "ScriptHash", "dataType": "bytes" },
  "Void": {
    "title": "Unit",
    "anyOf": [{ "dataType": "constructor", "index": 0, "fields": [] }],
  },
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
  "smtt/RunDatum": {
    "title": "RunDatum",
    "anyOf": [{
      "title": "RunDatum",
      "dataType": "constructor",
      "index": 0,
      "fields": [{ "title": "started", "$ref": "#/definitions/Bool" }],
    }],
  },
  "smtt/TagDatum": {
    "title": "TagDatum",
    "anyOf": [{
      "title": "TagDatum",
      "dataType": "constructor",
      "index": 0,
      "fields": [{ "title": "pool", "$ref": "#/definitions/List$ByteArray" }],
    }],
  },
};

export interface SimpleTrueSpend {
  new (_tagMint: PolicyId): Script;
  _d: Void;
  _r: Void;
}

export const SimpleTrueSpend = Object.assign(
  function (_tagMint: PolicyId) {
    return {
      type: "PlutusV3",
      script: applyParamsToScript(
        [_tagMint],
        "587b01010032323232323223225333004323232323253330093370e900118051baa0011323232324a2a66601866e1d2000300d375400a2a66601e601c6ea80145261616300f3010002300e001300b37540022c6018601a004601600260160046012002600c6ea800452613656375c002ae6955ceaab9e5573eae855d11",
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
  { _d: { "shape": { "$ref": "#/definitions/Void" }, definitions } },
  { _r: { "shape": { "$ref": "#/definitions/Void" }, definitions } },
) as unknown as SimpleTrueSpend;

export interface SmttRunSpend {
  new (
    _sttMint: PolicyId,
    _tagMint: PolicyId,
    _tagSpend: ScriptHash,
    _contractSpend: ScriptHash,
    _splitThreshold: Int,
  ): Script;
  _d: SmttRunDatum;
  _r: Void;
}

export const SmttRunSpend = Object.assign(
  function (
    _sttMint: PolicyId,
    _tagMint: PolicyId,
    _tagSpend: ScriptHash,
    _contractSpend: ScriptHash,
    _splitThreshold: Int,
  ) {
    return {
      type: "PlutusV3",
      script: applyParamsToScript(
        [_sttMint, _tagMint, _tagSpend, _contractSpend, _splitThreshold],
        "588f0101003232323232322322322322322322533300c323232323253330113370e900118091baa0011323232324a2a66602866e1d20003015375400a2a66602e602c6ea80145261616301730180023016001301337540022c6028602a004602600260260046022002601c6ea800452613656375a0026eb8004dd70009bae001375c002ae6955ceaab9e5573eae855d101",
        {
          "shape": {
            "dataType": "list",
            "items": [
              { "$ref": "#/definitions/PolicyId" },
              { "$ref": "#/definitions/PolicyId" },
              { "$ref": "#/definitions/ScriptHash" },
              { "$ref": "#/definitions/ScriptHash" },
              { "$ref": "#/definitions/Int" },
            ],
          },
          definitions,
        } as any,
      ),
    };
  },
  { _d: { "shape": { "$ref": "#/definitions/smtt/RunDatum" }, definitions } },
  { _r: { "shape": { "$ref": "#/definitions/Void" }, definitions } },
) as unknown as SmttRunSpend;

export interface SmttSttMint {
  new (_utxo: CardanoTransactionOutputReference): Script;
  _r: Void;
}

export const SmttSttMint = Object.assign(
  function (_utxo: CardanoTransactionOutputReference) {
    return {
      type: "PlutusV3",
      script: applyParamsToScript(
        [_utxo],
        "5870010100323232323232225333003323232323253330083370e900018049baa001132324a2a66601266e1d2000300a37540062a66601860166ea800c5261616375c601860146ea800458c02cc030008c028004c028008c020004c014dd50008a4c26cacae6955ceaab9e5573eae855d101",
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
  { _r: { "shape": { "$ref": "#/definitions/Void" }, definitions } },
) as unknown as SmttSttMint;

export interface SmttTagSpend {
  new (_sttMint: PolicyId): Script;
  _d: SmttTagDatum;
  _r: Void;
}

export const SmttTagSpend = Object.assign(
  function (_sttMint: PolicyId) {
    return {
      type: "PlutusV3",
      script: applyParamsToScript(
        [_sttMint],
        "58ad0101003232323232322322533300432323232323253233300b3370e9001001099191919251533300e3004300f375400e2a66602260206ea801c5261616301130120023010001300d37540062a6660166002004264649454ccc030c008c034dd50028a99980798071baa00514985858dd7180798069baa00316370e900018051baa001300c300d002300b001300b00230090013006375400229309b2b1bae0015734aae7555cf2ab9f5742ae881",
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
  { _r: { "shape": { "$ref": "#/definitions/Void" }, definitions } },
) as unknown as SmttTagSpend;

export interface SmttTagMint {
  new (_sttMint: PolicyId): Script;
  _r: Void;
}

export const SmttTagMint = Object.assign(
  function (_sttMint: PolicyId) {
    return {
      type: "PlutusV3",
      script: applyParamsToScript(
        [_sttMint],
        "58ad0101003232323232322322533300432323232323253233300b3370e9001001099191919251533300e3004300f375400e2a66602260206ea801c5261616301130120023010001300d37540062a6660166002004264649454ccc030c008c034dd50028a99980798071baa00514985858dd7180798069baa00316370e900018051baa001300c300d002300b001300b00230090013006375400229309b2b1bae0015734aae7555cf2ab9f5742ae881",
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
  { _r: { "shape": { "$ref": "#/definitions/Void" }, definitions } },
) as unknown as SmttTagMint;
