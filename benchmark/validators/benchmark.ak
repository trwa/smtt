use aiken/collection/dict
use aiken/collection/list
use aiken/crypto.{ScriptHash}
use cardano/assets.{PolicyId, tokens}
use cardano/transaction.{
  InlineDatum, Input, Output, OutputReference, Transaction, find_input,
}

pub type Storage {
  pairs: Pairs<ByteArray, ByteArray>,
}

pub type Empty {
  Empty
}

fn has_tag(output: Output, tag_policy: PolicyId) -> Bool {
  // Check the presence of tag tokens in the output
  let tags = tokens(output.value, tag_policy)
  // There must be only one tag token in the output
  expect [tag_name] = dict.keys(tags)
  // And the amount of the tag must be exactly 1
  expect Some(1) = dict.get(tags, tag_name)
  // Ok, the output has the tag
  True
}

fn own_inputs(inputs: List<Input>, script_hash: ScriptHash) -> List<Input> {
  inputs
    |> list.filter(
        fn(input) {
          when input.output.reference_script is {
            None -> False
            Some(hash) -> hash == script_hash
          }
        },
      )
}

fn own_outputs(outputs: List<Output>, script_hash: ScriptHash) -> List<Output> {
  outputs
    |> list.filter(
        fn(output) {
          when output.reference_script is {
            None -> False
            Some(hash) -> hash == script_hash
          }
        },
      )
}

validator local(
  _id: ByteArray,
  tag_policy: PolicyId,
  _chunk_size: Int,
  _num_chunks: Int,
) {
  spend(
    datum: Option<Storage>,
    _redeemer: Empty,
    output_reference: OutputReference,
    self: Transaction,
  ) {
    // Find the script's own input
    expect Some(input) = find_input(self.inputs, output_reference)
    // Check the presence of the tag in the input
    expect has_tag(input.output, tag_policy)
    // Get the script's hash from the input
    expect Some(script_hash) = input.output.reference_script
    // Find the script's outputs
    let outputs: List<Output> = own_outputs(self.outputs, script_hash)
    // Check the presence of the tag in the script's outputs
    expect list.all(outputs, fn(output) { has_tag(output, tag_policy) })
    // Read the script's datum
    expect Some(Storage { pairs }) = datum
    // Convert the list to a dictionary (n*log(n) complexity) (realistic use case)
    expect _storage = dict.from_pairs(pairs)
    // Always succeed (after this, we are just benchmarking the validator's logic)
    True
  }

  else(_) {
    fail
  }
}

validator global(
  _id: ByteArray,
  tag_policy: PolicyId,
  _chunk_size: Int,
  _num_chunks: Int,
) {
  spend(
    _datum: Option<Storage>,
    _redeemer: Empty,
    output_reference: OutputReference,
    self: Transaction,
  ) {
    // Find the script's own input
    expect Some(input) = find_input(self.inputs, output_reference)
    // Get the script's hash from the input
    expect Some(script_hash) = input.output.reference_script
    // Find the script's inputs
    let inputs: List<Input> = own_inputs(self.inputs, script_hash)
    // Check the presence of the tag in the script's inputs
    expect list.all(inputs, fn(input) { has_tag(input.output, tag_policy) })
    // Find the script's outputs
    let outputs: List<Output> = own_outputs(self.outputs, script_hash)
    // Check the presence of the tag in the script's outputs
    expect list.all(outputs, fn(output) { has_tag(output, tag_policy) })
    // Read the script's datum from all inputs
    let pairs: Pairs<ByteArray, ByteArray> =
      list.flat_map(
        inputs,
        fn(input) {
          expect InlineDatum(data) = input.output.datum
          expect Storage { pairs } = data
          pairs
        },
      )
    // Convert the list to a dictionary (n*log(n) complexity) (realistic use case)
    expect _storage = dict.from_pairs(pairs)
    // Always succeed (after this, we are just benchmarking the validator's logic)
    // Here we can use storage TRANSPARENTLY as if it was in a single input
    // TODO: check only the script with the lexicographically smallest hash should execute, all others should just succeed
    True
  }

  else(_) {
    fail
  }
}
