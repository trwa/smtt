use aiken/crypto.{ScriptHash}
use cardano/assets.{PolicyId}
use cardano/transaction.{OutputReference, Transaction}

pub type RunDatum {
  started: Bool,
}

pub type TagDatum {
  pool: List<ByteArray>,
}

validator stt(_utxo: OutputReference) {
  mint(_r: Void, _o: OutputReference, _s: Transaction) {
    True
  }

  else(_) {
    fail
  }
}

validator run(
  _stt_mint: PolicyId,
  _tag_mint: PolicyId,
  _tag_spend: ScriptHash,
  _contract_spend: ScriptHash,
  _split_threshold: Int,
) {
  spend(_d: Option<RunDatum>, _r: Void, _o: OutputReference, _s: Transaction) {
    True
  }

  else(_) {
    fail
  }
}

validator tag(_stt_mint: PolicyId) {
  spend(_d: Option<TagDatum>, _r: Void, _o: OutputReference, _s: Transaction) {
    True
  }

  mint(_r: Void, _o: OutputReference, _s: Transaction) {
    True
  }

  else(_) {
    fail
  }
}
