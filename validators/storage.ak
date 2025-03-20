use aiken/crypto.{ScriptHash}
use cardamove/io.{get_boundary}
use cardamove/validators.{
  KeyDatum, RunDatum, key_mint, key_spend, run_spend, stt_mint,
}
use cardano/assets.{PolicyId}
use cardano/transaction.{OutputReference, Transaction}

validator stt(output_reference: OutputReference) {
  mint(_r, policy_id: PolicyId, tx: Transaction) {
    get_boundary(tx) |> stt_mint(policy_id, output_reference)
  }

  else(_) {
    fail
  }
}

validator run(
  stt_policy: PolicyId,
  run_hash: ScriptHash,
  key_policy: PolicyId,
  key_hash: ScriptHash,
  max_size: Int,
) {
  spend(_d: Option<RunDatum>, _r, _o, tx: Transaction) {
    get_boundary(tx)
      |> run_spend(stt_policy, run_hash, key_policy, key_hash, max_size)
  }

  else(_) {
    fail
  }
}

validator key(stt_policy: PolicyId) {
  mint(_r, _p, tx: Transaction) {
    get_boundary(tx) |> key_mint(stt_policy)
  }

  spend(_d: Option<KeyDatum>, _r, _o, tx: Transaction) {
    get_boundary(tx) |> key_spend(stt_policy)
  }

  else(_) {
    fail
  }
}
