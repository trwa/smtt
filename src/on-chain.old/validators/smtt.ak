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
    trace @"Checking one-time output reference is spent..."
    expect Some(_) = find_input(self.inputs, out_ref)

    trace @"Checking there is only one value with the policy id of STT..."
    expect [(address, (_, name, amount))] =
      utils.asset_list_output(self)
        |> list.filter(fn((_, (p, _, _))) { p == policy })

    trace @"Checking the asset is sent to a script address..."
    expect Script(hash) = address

    trace @"Checking the asset is 1..."
    expect amount == 1

    trace @"Checking the asset name is the same as the script hash...": name, hash
    expect name == hash

    trace @"Getting the full UTxO containing the STT..."
    expect [utxo] =
      utils.utxo_list_output(self)
        |> list.filter(fn(u) { u.address == address })
    trace @"Expecting the UTxO contains an inline datum..."
    expect InlineDatum(datum) = utxo.datum

    trace @"Checking the datum is a RunDatum..."
    expect datum: RunDatum = datum

    trace @"Checking the datum is a RunDatum with started = False..."
    expect datum.started == False

    trace @"All good."
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
