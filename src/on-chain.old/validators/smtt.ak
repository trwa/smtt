use aiken/collection/list
use cardano/address.{Script}
use cardano/assets.{AssetName, PolicyId}
use cardano/transaction.{OutputReference, Redeemer, Transaction, find_input}
use smtt/utils

pub type TagDatum {
  pool: List<AssetName>,
}

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

validator tag(stt_mint: PolicyId) {
  mint(_r: Redeemer, _p: PolicyId, self: Transaction) {
    utils.asset_list_output(self)
      |> list.any(fn((_, (policy, _, _))) { policy == stt_mint })
  }

  spend(
    _d: Option<TagDatum>,
    _r: Redeemer,
    _o: OutputReference,
    self: Transaction,
  ) {
    utils.asset_list_output(self)
      |> list.any(fn((_, (policy, _, _))) { policy == stt_mint })
  }

  else(_) {
    fail @"Validator Tag only valid for minting and spending"
  }
}
