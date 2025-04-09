use aiken/collection/list
use aiken/crypto.{ScriptHash}
use aiken/primitive/bytearray
use cardano/assets.{AssetName, PolicyId}
use cardano/transaction.{OutputReference}
use smtt/io.{ScriptInput, ScriptOutput, ScriptUTxO, TransactionBoundary}

pub type KeyDatum {
  keys: List<AssetName>,
}

pub fn key_mint(io: TransactionBoundary, stt_policy: PolicyId) -> Bool {
  some_token_in_script_inputs(io, stt_policy)
}

pub fn key_spend(io: TransactionBoundary, stt_policy: PolicyId) -> Bool {
  some_token_in_script_inputs(io, stt_policy)
}

fn some_token_in_script_inputs(
  io: TransactionBoundary,
  policy_id: PolicyId,
) -> Bool {
  [] != list.filter(
    io.script_inputs,
    fn(output) {
      list.any(output.utxo.assets, fn(asset) { asset.1st == policy_id })
    },
  )
}

type KeyInput {
  script_address: ScriptHash,
  ordered_keys: List<AssetName>,
  lower_key: AssetName,
  upper_key: AssetName,
}

type KeyOutput {
  WithSplit {
    left_output: KeyInput,
    right_output: KeyInput,
    minted_key: AssetName,
  }
  WithoutSplit { only_output: KeyInput, minted_key: AssetName }
}

pub fn to_key_input(any: ScriptInput<Data>) -> ScriptInput<KeyDatum> {
  expect datum: KeyDatum = any.utxo.datum
  ScriptInput {
    output_reference: any.output_reference,
    utxo: ScriptUTxO {
      script_address: any.utxo.script_address,
      datum,
      assets: any.utxo.assets,
    },
  }
}

pub fn to_key_output(any: ScriptOutput<Data>) -> ScriptOutput<KeyDatum> {
  expect datum: KeyDatum = any.utxo.datum
  ScriptOutput {
    utxo: ScriptUTxO {
      script_address: any.utxo.script_address,
      datum,
      assets: any.utxo.assets,
    },
  }
}
