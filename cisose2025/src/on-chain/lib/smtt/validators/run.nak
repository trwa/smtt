use aiken/collection/list
use aiken/crypto.{ScriptHash}
use aiken/primitive/bytearray
use cardano/assets.{AssetName, PolicyId}
use cardano/transaction.{OutputReference}
use smtt/io.{ScriptInput, ScriptOutput, ScriptUTxO, TransactionBoundary}
use smtt/validators/tag
use smtt/types.{RunDatum}

pub fn run_spend(
  io: TransactionBoundary,
  stt_policy: PolicyId,
  run_hash: ScriptHash,
  key_policy: PolicyId,
  key_hash: ScriptHash,
  _max_size: Int,
) -> Bool {
  // -------------------------------------------------------------------------------------------------------------------
  // Condition. There is only one invocation of the script in the transaction
  // -------------------------------------------------------------------------------------------------------------------
  expect [own_input] =
    io.script_inputs
      |> list.filter(fn(input) { input.utxo.script_address == run_hash })
      |> list.map(to_run_input)
  //
  // -------------------------------------------------------------------------------------------------------------------
  // Condition. There is only one output of the script in the transaction
  // -------------------------------------------------------------------------------------------------------------------
  expect [own_output] =
    io.script_outputs
      |> list.filter(fn(output) { output.utxo.script_address == run_hash })
      |> list.map(to_run_output)
  // 
  // -------------------------------------------------------------------------------------------------------------------
  // Condition. There is one STT paid to the script in the inputs
  // -------------------------------------------------------------------------------------------------------------------
  expect
    own_input.utxo.assets
      |> list.any(fn(asset) { asset == (stt_policy, run_hash, 1) })
  //
  // -------------------------------------------------------------------------------------------------------------------
  // Condition. There is one STT paid to the script in the outputs
  // -------------------------------------------------------------------------------------------------------------------
  expect
    own_output.utxo.assets
      |> list.any(fn(asset) { asset == (stt_policy, run_hash, 1) })
  //
  // -------------------------------------------------------------------------------------------------------------------
  // Binding. Get all the inputs of the key spending validator
  // -------------------------------------------------------------------------------------------------------------------
  let key_inputs =
    io.script_inputs
      |> list.filter(fn(input) { input.utxo.script_address == key_hash })
      |> list.map(tag.to_key_input)
  //
  // -------------------------------------------------------------------------------------------------------------------
  // Binding. Get all the outputs of the key spending validator
  // -------------------------------------------------------------------------------------------------------------------
  let key_outputs =
    io.script_outputs
      |> list.filter(fn(output) { output.utxo.script_address == key_hash })
      |> list.map(tag.to_key_output)
  //
  // -------------------------------------------------------------------------------------------------------------------
  // Case analysis. The process has started, or not
  // -------------------------------------------------------------------------------------------------------------------
  if own_input.utxo.datum.started {
    // -----------------------------------------------------------------------------------------------------------------
    // Condition. The process has started, the key spend script has been called
    // -----------------------------------------------------------------------------------------------------------------
    expect [key_input] = key_inputs
    //
    // -----------------------------------------------------------------------------------------------------------------
    // Case analysis. The key spend script has split the output, or not
    // -----------------------------------------------------------------------------------------------------------------
    when key_outputs is {
      //
      // ---------------------------------------------------------------------------------------------------------------
      // Case 1 of 2. The key spend script has not split the output
      // ---------------------------------------------------------------------------------------------------------------
      [key_output] -> {
        expect key_input.utxo.datum.keys == key_output.utxo.datum.keys
        expect key_input.utxo.assets == key_output.utxo.assets
        expect key_input.utxo.script_address == key_output.utxo.script_address
        True
      }
      //
      // ---------------------------------------------------------------------------------------------------------------
      // Case 2 of 2. The key spend script has split the output
      // ---------------------------------------------------------------------------------------------------------------
      [key_output1, key_output2] -> {
        expect [(policy11, key_lower1, 1),
          (policy21, key_upper1, 1)] =
          key_output1.utxo.assets
            |> list.sort(fn((_, a, _), (_, b, _)) { bytearray.compare(a, b) })
        expect policy11 == key_policy
        expect policy21 == key_policy

        expect [(policy12, key_lower2, 1),
          (policy22, key_upper2, 1)] =
          key_output2.utxo.assets
            |> list.sort(fn((_, a, _), (_, b, _)) { bytearray.compare(a, b) })
        expect policy12 == key_policy
        expect policy22 == key_policy

        True
      }
      _ -> False
    }
  } else {
    // -----------------------------------------------------------------------------------------------------------------
    // Condition. Since the process has not started, the key spend script has not been called
    // -----------------------------------------------------------------------------------------------------------------
    expect [] == key_inputs
    //
    // -----------------------------------------------------------------------------------------------------------------
    // Condition. There is only one output with the list of minted keys
    // -----------------------------------------------------------------------------------------------------------------
    expect [key_output] = key_outputs
    //
    // -----------------------------------------------------------------------------------------------------------------
    // Condition. There are no minted keys, yet
    // -----------------------------------------------------------------------------------------------------------------
    expect list.is_empty(key_output.utxo.datum.keys)
    //
    // -----------------------------------------------------------------------------------------------------------------
    // Condition. There are the two tokens representing the maximum range of keys
    // -----------------------------------------------------------------------------------------------------------------
    expect [(policy1, key_lower, 1),
      (policy2, key_upper, 1)] =
      key_output.utxo.assets
        |> list.sort(fn((_, a, _), (_, b, _)) { bytearray.compare(a, b) })
    expect policy1 == key_policy
    expect policy2 == key_policy
    expect and {
        @"0000000000000000000000000000000000000000000000000000000000000000" == bytearray.to_hex(
          key_lower,
        ),
        @"ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff" == bytearray.to_hex(
          key_upper,
        ),
      }
    //
    // -----------------------------------------------------------------------------------------------------------------
    // Ok. The conditions are met
    // -----------------------------------------------------------------------------------------------------------------
    True
  }
}

pub fn to_run_input(any: ScriptInput<Data>) -> ScriptInput<RunDatum> {
  expect datum: RunDatum = any.utxo.datum
  ScriptInput {
    output_reference: any.output_reference,
    utxo: ScriptUTxO {
      script_address: any.utxo.script_address,
      datum,
      assets: any.utxo.assets,
    },
  }
}

pub fn to_run_output(any: ScriptOutput<Data>) -> ScriptOutput<RunDatum> {
  expect datum: RunDatum = any.utxo.datum
  ScriptOutput {
    utxo: ScriptUTxO {
      script_address: any.utxo.script_address,
      datum,
      assets: any.utxo.assets,
    },
  }
}
