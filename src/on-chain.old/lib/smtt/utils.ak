use cardano/address.{PaymentCredential}
use cardano/assets.{AssetName, PolicyId, flatten}
use cardano/transaction.{Datum, Input, Output, Transaction}
use smtt/monad/list

pub type UTxO<d> {
  address: PaymentCredential,
  assets: List<(PolicyId, AssetName, Int)>,
  datum: d,
}

pub fn utxo_list_input(self: Transaction) -> List<UTxO<Datum>> {
  let input: Input <- list.bind(self.inputs)
  list.return(to_utxo_(input.output))
}

pub fn utxo_list_output(self: Transaction) -> List<UTxO<Datum>> {
  let output: Output <- list.bind(self.outputs)
  list.return(to_utxo_(output))
}

pub fn asset_list_input(
  self: Transaction,
) -> List<(PaymentCredential, (PolicyId, AssetName, Int))> {
  let input: UTxO<Datum> <- list.bind(utxo_list_input(self))
  let asset: (PolicyId, AssetName, Int) <- list.bind(input.assets)
  list.return((input.address, asset))
}

pub fn asset_list_output(
  self: Transaction,
) -> List<(PaymentCredential, (PolicyId, AssetName, Int))> {
  let output: UTxO<Datum> <- list.bind(utxo_list_output(self))
  let asset: (PolicyId, AssetName, Int) <- list.bind(output.assets)
  list.return((output.address, asset))
}

fn to_utxo_(output: Output) -> UTxO<Datum> {
  UTxO {
    address: output.address.payment_credential,
    assets: flatten(output.value),
    datum: output.datum,
  }
}
