use cardano/transaction.{OutputReference, Transaction}

validator true {
  spend(_d: Option<Void>, _r: Void, _o: OutputReference, _s: Transaction) {
    True
  }

  else(_) {
    fail
  }
}
