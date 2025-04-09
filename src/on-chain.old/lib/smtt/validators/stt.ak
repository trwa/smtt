use aiken/collection/list
use aiken/crypto.{ScriptHash}
use aiken/primitive/bytearray
use cardano/assets.{AssetName, PolicyId}
use cardano/transaction.{OutputReference}
use smtt/io.{ScriptInput, ScriptOutput, ScriptUTxO, TransactionBoundary}
use smtt/validators/run.{RunDatum}

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
      |> list.map(run.to_run_output)
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
