use aiken/collection/list
use aiken/crypto.{ScriptHash}
use aiken/primitive/bytearray
use cardamove/io.{ScriptInput, ScriptOutput, ScriptUTxO, TransactionBoundary}
use cardano/assets.{AssetName, PolicyId}
use cardano/transaction.{OutputReference}

// =====================================================================================================================
// STT
// =====================================================================================================================

pub fn stt_mint(
  io: TransactionBoundary,
  stt_policy: PolicyId,
  output_reference: OutputReference,
) -> Bool {
  // Condition. The output_reference is spent during the transaction
  let user_inputs_with_output_reference =
    io.user_inputs
      |> list.filter(fn(input) { input.output_reference == output_reference })
  let script_inputs_with_output_reference =
    io.script_inputs
      |> list.filter(fn(input) { input.output_reference == output_reference })
  expect or {
      and {
        [] != user_inputs_with_output_reference,
        [] == script_inputs_with_output_reference,
      },
      and {
        [] == user_inputs_with_output_reference,
        [] != script_inputs_with_output_reference,
      },
    }
  // Condition. There is no STT paid to any user in the outputs
  let user_outputs_with_token =
    io.user_outputs
      |> list.filter(
          fn(output) {
            list.any(output.utxo.assets, fn(asset) { asset.1st == stt_policy })
          },
        )
  expect [] == user_outputs_with_token
  // Condition. There is one output with "some" STT
  expect [output] =
    io.script_outputs
      |> list.filter(
          fn(output) {
            list.any(output.utxo.assets, fn(asset) { asset.1st == stt_policy })
          },
        )
      |> list.map(to_run_output)
  // Condition. The output has exactly 1 STT with asset_name = address of the script it is paid to
  let list_one =
    fn(xs, pred) { 1 == list.count(xs, pred) }
  expect and {
      output.utxo.assets |> list_one(fn(asset) { asset.1st == stt_policy }),
      output.utxo.assets
        |> list_one(
            fn(asset) { asset == (stt_policy, output.utxo.script_address, 1) },
          ),
    }
  // Condition. The RunDatum encodes that the process has not started
  expect RunDatum { started: False } = output.utxo.datum
  True
}

// =====================================================================================================================
// Run
// =====================================================================================================================

pub type RunDatum {
  started: Bool,
}

pub fn run_spend(
  io: TransactionBoundary,
  stt_policy: PolicyId,
  run_hash: ScriptHash,
  key_policy: PolicyId,
  key_hash: ScriptHash,
  max_size: Int,
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
      |> list.map(to_key_input)
  //
  // -------------------------------------------------------------------------------------------------------------------
  // Binding. Get all the outputs of the key spending validator
  // -------------------------------------------------------------------------------------------------------------------
  let key_outputs =
    io.script_outputs
      |> list.filter(fn(output) { output.utxo.script_address == key_hash })
      |> list.map(to_key_output)
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
        @"00000000000000000000000000000000" == bytearray.to_hex(key_lower),
        @"ffffffffffffffffffffffffffffffff" == bytearray.to_hex(key_upper),
      }
    //
    // -----------------------------------------------------------------------------------------------------------------
    // Ok. The conditions are met
    // -----------------------------------------------------------------------------------------------------------------
    True
  }
}

// =====================================================================================================================
// Key
// =====================================================================================================================

pub type KeyDatum {
  keys: List<AssetName>,
}

pub fn key_mint(io: TransactionBoundary, stt_policy: PolicyId) -> Bool {
  some_token_in_script_inputs(io, stt_policy)
}

pub fn key_spend(io: TransactionBoundary, stt_policy: PolicyId) -> Bool {
  some_token_in_script_inputs(io, stt_policy)
}

// =====================================================================================================================
// Utils
// =====================================================================================================================

type MainInput {
  script_address: ScriptHash,
  has_started: Bool,
}

type MainOutput =
  MainInput

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

fn to_run_input(any: ScriptInput<Data>) -> ScriptInput<RunDatum> {
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

fn to_run_output(any: ScriptOutput<Data>) -> ScriptOutput<RunDatum> {
  expect datum: RunDatum = any.utxo.datum
  ScriptOutput {
    utxo: ScriptUTxO {
      script_address: any.utxo.script_address,
      datum,
      assets: any.utxo.assets,
    },
  }
}

fn to_key_input(any: ScriptInput<Data>) -> ScriptInput<KeyDatum> {
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

fn to_key_output(any: ScriptOutput<Data>) -> ScriptOutput<KeyDatum> {
  expect datum: KeyDatum = any.utxo.datum
  ScriptOutput {
    utxo: ScriptUTxO {
      script_address: any.utxo.script_address,
      datum,
      assets: any.utxo.assets,
    },
  }
}
