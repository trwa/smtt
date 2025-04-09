use aiken/collection/list
use aiken/crypto.{ScriptHash, VerificationKeyHash}
use cardano/address.{Address, Script, VerificationKey}
use cardano/assets.{AssetName, PolicyId, flatten}
use cardano/transaction.{
  InlineDatum, Input, Output, OutputReference, Transaction,
}

pub type Asset =
  (PolicyId, AssetName, Int)

pub type UserUTxO {
  user_address: VerificationKeyHash,
  assets: List<Asset>,
}

pub type ScriptUTxO<d> {
  script_address: ScriptHash,
  datum: d,
  assets: List<Asset>,
}

pub type UserInput {
  output_reference: OutputReference,
  utxo: UserUTxO,
}

pub type ScriptInput<d> {
  output_reference: OutputReference,
  utxo: ScriptUTxO<d>,
}

pub type UserOutput {
  utxo: UserUTxO,
}

pub type ScriptOutput<d> {
  utxo: ScriptUTxO<d>,
}

pub type TransactionBoundary {
  user_inputs: List<UserInput>,
  user_outputs: List<UserOutput>,
  script_inputs: List<ScriptInput<Data>>,
  script_outputs: List<ScriptOutput<Data>>,
}

fn get_user_inputs(self: Transaction) -> List<UserInput> {
  self.inputs
    |> list.filter_map(
        fn(input: Input) {
          when input.output.address.payment_credential is {
            VerificationKey(hash) ->
              Some(
                UserInput {
                  output_reference: input.output_reference,
                  utxo: UserUTxO {
                    user_address: hash,
                    assets: flatten(input.output.value),
                  },
                },
              )
            _ -> None
          }
        },
      )
}

fn get_script_inputs(self: Transaction) -> List<ScriptInput<Data>> {
  self.inputs
    |> list.filter_map(
        fn(input: Input) {
          when input.output.address.payment_credential is {
            Script(hash) -> {
              expect InlineDatum(data) = input.output.datum
              Some(
                ScriptInput {
                  output_reference: input.output_reference,
                  utxo: ScriptUTxO {
                    script_address: hash,
                    assets: flatten(input.output.value),
                    datum: data,
                  },
                },
              )
            }
            _ -> None
          }
        },
      )
}

fn get_user_outputs(self: Transaction) -> List<UserOutput> {
  self.outputs
    |> list.filter_map(
        fn(output: Output) {
          when output.address.payment_credential is {
            VerificationKey(hash) ->
              Some(
                UserOutput {
                  utxo: UserUTxO {
                    user_address: hash,
                    assets: flatten(output.value),
                  },
                },
              )
            _ -> None
          }
        },
      )
}

fn get_script_outputs(self: Transaction) -> List<ScriptOutput<Data>> {
  self.outputs
    |> list.filter_map(
        fn(output: Output) {
          when output.address.payment_credential is {
            Script(hash) -> {
              expect InlineDatum(data) = output.datum
              Some(
                ScriptOutput {
                  utxo: ScriptUTxO {
                    script_address: hash,
                    assets: flatten(output.value),
                    datum: data,
                  },
                },
              )
            }
            _ -> None
          }
        },
      )
}

pub fn get_boundary(self: Transaction) -> TransactionBoundary {
  TransactionBoundary {
    user_inputs: get_user_inputs(self),
    user_outputs: get_user_outputs(self),
    script_inputs: get_script_inputs(self),
    script_outputs: get_script_outputs(self),
  }
}
