use aiken/crypto.{ScriptHash}
use cardano/assets.{PolicyId}
use cardano/transaction.{OutputReference, Transaction, find_input}
use smtt/io.{get_boundary}
use smtt/validators/run.{RunDatum} as vrun
use smtt/validators/stt as vstt
use smtt/validators/tag.{KeyDatum} as vtag

validator stt(utxo: OutputReference) {
  mint(_r: Void, policy: PolicyId, self: Transaction) {
    get_boundary(self) |> vstt.stt_mint(policy, utxo)
  }

  else(_) {
    fail
  }
}

validator run(
  stt_mint: PolicyId,
  tag_mint: PolicyId,
  tag_spend: ScriptHash,
  _contract_spend: ScriptHash,
  split_threshold: Int,
) {
  spend(
    _d: Option<RunDatum>,
    _r: Void,
    utxo: OutputReference,
    self: Transaction,
  ) {
    expect Some(input) = find_input(self.inputs, utxo)
    expect Some(hash) = input.output.reference_script
    get_boundary(self)
      |> vrun.run_spend(stt_mint, hash, tag_mint, tag_spend, split_threshold)
  }

  else(_) {
    fail
  }
}

validator tag(stt_mint: PolicyId) {
  mint(_r: Void, _p: PolicyId, self: Transaction) {
    get_boundary(self) |> vtag.key_mint(stt_mint)
  }

  spend(_d: Option<KeyDatum>, _r: Void, _o: OutputReference, self: Transaction) {
    get_boundary(self) |> vtag.key_spend(stt_mint)
  }

  else(_) {
    fail
  }
}
