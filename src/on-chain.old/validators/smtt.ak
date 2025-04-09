use aiken/collection/list
use aiken/crypto.{ScriptHash}
use cardano/address.{Script}
use cardano/assets.{AssetName, PolicyId}
use cardano/transaction.{InlineDatum, OutputReference, Transaction, find_input}
use smtt/utils

pub type TagDatum {
  pool: List<AssetName>,
}

pub type RunDatum {
  started: Bool,
}

validator stt(out_ref: OutputReference) {
  mint(_r: Void, policy: PolicyId, self: Transaction) {
    expect Some(_) = find_input(self.inputs, out_ref)
    expect [(address, (_, name, amount))] =
      utils.asset_list_output(self)
        |> list.filter(fn((_, (p, _, _))) { p == policy })
    expect Script(hash) = address
    expect amount == 1 && name == hash
    expect [utxo] =
      utils.utxo_list_output(self)
        |> list.filter(fn(u) { u.address == address })
    expect InlineDatum(datum) = utxo.datum
    expect datum: RunDatum = datum
    expect datum.started == False
    True
  }

  else(_) {
    fail @"Validator STT only for minting"
  }
}

validator tag(stt_mint: PolicyId) {
  mint(_r: Void, _p: PolicyId, self: Transaction) {
    utils.asset_list_output(self)
      |> list.any(fn((_, (policy, _, _))) { policy == stt_mint })
  }

  spend(_d: Option<TagDatum>, _r: Void, _o: OutputReference, self: Transaction) {
    utils.asset_list_output(self)
      |> list.any(fn((_, (policy, _, _))) { policy == stt_mint })
  }

  else(_) {
    fail @"Validator Tag only for minting and spending"
  }
}

validator run(
  _stt_mint: PolicyId,
  _tag_mint: PolicyId,
  _tag_spend: ScriptHash,
  _contract_spend: ScriptHash,
  _split_threshold: Int,
) {
  spend(
    _d: Option<RunDatum>,
    _r: Void,
    _utxo: OutputReference,
    _self: Transaction,
  ) {
    True
  }

  else(_) {
    fail @"Validator Run only for spending"
  }
}
