use aiken/collection/list
use cardano/address.{Script}
use cardano/assets.{PolicyId}
use cardano/transaction.{OutputReference, Redeemer, Transaction, find_input}
use smtt/utils

validator stt(utxo: OutputReference) {
  mint(_r: Redeemer, policy_id: PolicyId, self: Transaction) {
    expect Some(_) = find_input(self.inputs, utxo)
    expect [(address, (_, name, amount))] =
      utils.asset_list_output(self)
        |> list.filter(fn((_, (policy, _, _))) { policy == policy_id })
    expect Script(hash) = address
    amount == 1 && name == hash
  }

  else(_) {
    fail @"Validator STT only valid for minting"
  }
}
