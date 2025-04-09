use aiken/crypto.{ScriptHash}
use cardamove/io.{get_boundary}
use cardamove/validators.{
  KeyDatum, RunDatum, key_mint, key_spend, run_spend, stt_mint,
}
use cardano/assets.{PolicyId}
use cardano/transaction.{OutputReference, Transaction, find_input}

validator stt(utxo: OutputReference) {
  mint(_r: Void, policy: PolicyId, self: Transaction) {
    get_boundary(self) |> stt_mint(policy, utxo)
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
      |> run_spend(stt_mint, hash, tag_mint, tag_spend, split_threshold)
  }

  else(_) {
    fail
  }
}

validator tag(stt_mint: PolicyId) {
  mint(_r: Void, _p: PolicyId, self: Transaction) {
    get_boundary(self) |> key_mint(stt_mint)
  }

  spend(_d: Option<KeyDatum>, _r: Void, _o: OutputReference, self: Transaction) {
    get_boundary(self) |> key_spend(stt_mint)
  }

  else(_) {
    fail
  }
}
