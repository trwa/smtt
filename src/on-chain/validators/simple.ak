use cardano/assets.{PolicyId}
use cardano/transaction.{OutputReference, Transaction}

validator true(_tag_mint: PolicyId) {
  spend(_d: Option<Void>, _r: Void, _o: OutputReference, _s: Transaction) {
    True
  }

  else(_) {
    fail
  }
}
