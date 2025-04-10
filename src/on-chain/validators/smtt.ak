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

fn stt_in_inputs(stt_mint: PolicyId, self: Transaction) {
  utils.asset_list_input(self)
    |> list.any(fn((_, (policy, _, _))) { policy == stt_mint })
}

validator stt(out_ref: OutputReference) {
  mint(_r: Void, policy: PolicyId, self: Transaction) {
    trace @"The output reference parameter must be consumed by the minting transaction to ensure a one-time minting policy."
    expect Some(_) = find_input(self.inputs, out_ref)
    trace @"There must be only one asset minted with this policy."
    expect [(address, (_, name, amount))] =
      utils.asset_list_output(self)
        |> list.filter(fn((_, (p, _, _))) { p == policy })
    trace @"The amount of the asset must be 1."
    expect amount == 1
    trace @"The asset must be sent to a script."
    expect Script(hash) = address
    trace @"The name of the asset must be the script's hash...": name, hash
    expect name == hash
    trace @"Obtaining the full UTxO holding the minted asset..."
    expect [utxo] =
      utils.utxo_list_output(self)
        |> list.filter(fn(u) { u.address == address })
    trace @"The UTxO must contain an inline datum."
    expect InlineDatum(datum) = utxo.datum
    trace @"The datum must have type RunDatum."
    expect datum: RunDatum = datum
    trace @"The field started must be False."
    expect datum.started == False
    trace @"Success."
    True
  }

  else(_) {
    fail @"Validator STT only for minting"
  }
}

validator tag(stt_mint: PolicyId) {
  mint(_r: Void, _p: PolicyId, self: Transaction) {
    trace @"The STT token must be present in the inputs to ensure invocation of Run."
    stt_in_inputs(stt_mint, self)
  }

  spend(_d: Option<TagDatum>, _r: Void, _o: OutputReference, self: Transaction) {
    trace @"The STT token must be present in the inputs to ensure invocation of Run."
    stt_in_inputs(stt_mint, self)
  }

  else(_) {
    fail @"Validator Tag only for minting and spending"
  }
}

fn run_start(_tag_mint: PolicyId, _tag_spend: ScriptHash) -> Bool {
  True
}

fn run_add(
  _tag_mint: PolicyId,
  _tag_spend: ScriptHash,
  _contract_spend: ScriptHash,
) -> Bool {
  True
}

validator run(
  stt_mint: PolicyId,
  tag_mint: PolicyId,
  tag_spend: ScriptHash,
  contract_spend: ScriptHash,
  _split_threshold: Int,
) {
  spend(
    option_datum: Option<RunDatum>,
    _r: Void,
    utxo: OutputReference,
    self: Transaction,
  ) {
    trace @"Obtaining the script's input..."
    expect Some(input) = find_input(self.inputs, utxo)
    trace @"Obtaining the script's hash..."
    expect Script(hash) = input.output.address.payment_credential
    trace @"There must be only one STT asset in the inputs."
    expect [(address, (_, name, amount))] =
      utils.asset_list_input(self)
        |> list.filter(fn((_, (p, _, _))) { p == stt_mint })
    trace @"The address must be the script's hash."
    expect address == Script(hash)
    trace @"The amount of the asset must be 1."
    expect amount == 1
    trace @"The name of the asset must be the script's hash...": name, hash
    expect name == hash
    trace @"There must be only one STT asset in the outputs."
    expect [(address, (_, name, amount))] =
      utils.asset_list_output(self)
        |> list.filter(fn((_, (p, _, _))) { p == stt_mint })
    trace @"The address must be the script's hash."
    expect address == Script(hash)
    trace @"The amount of the asset must be 1."
    expect amount == 1
    trace @"The name of the asset must be the script's hash...": name, hash
    expect name == hash
    trace @"Obtaining the full output UTxO holding the STT..."
    expect [utxo] =
      utils.utxo_list_output(self)
        |> list.filter(fn(u) { u.address == address })
    trace @"The UTxO must contain an inline datum."
    expect InlineDatum(datum) = utxo.datum
    trace @"The datum must have type RunDatum."
    expect datum: RunDatum = datum
    trace @"The field started must be False."
    expect datum.started == True
    trace @"The current datum must exist."
    expect Some(datum) = option_datum
    if !datum.started {
      run_start(tag_mint, tag_spend)
    } else {
      run_add(tag_mint, tag_spend, contract_spend)
    }
  }

  else(_) {
    fail @"Validator Run only for spending"
  }
}
