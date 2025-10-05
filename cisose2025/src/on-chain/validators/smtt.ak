use aiken/collection/list
use aiken/crypto.{ScriptHash}
use aiken/primitive/bytearray
use cardano/address.{Script}
use cardano/assets.{AssetName, PolicyId}
use cardano/transaction.{
  InlineDatum, Mint, OutputReference, Transaction, find_input,
}
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
    // =================================================================================================================
    // Checking the STT in the inputs
    // =================================================================================================================
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
    // =================================================================================================================
    // Checking the datum in the outputs
    // =================================================================================================================
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

type TagInputSituation {
  TagInputZero
  TagInputTwo { lower: AssetName, upper: AssetName }
  TagInputWrong
}

type TagOutputSituation {
  TagOutputTwo { lower: AssetName, upper: AssetName }
  TagOutputThree { lower: AssetName, upper: AssetName, new: AssetName }
  TagOutputFive {
    lowerLeft: AssetName,
    upperLeft: AssetName,
    lowerRight: AssetName,
    upperRight: AssetName,
    new: AssetName,
  }
  TagOutputWrong
}

fn tag_input_situation(
  tag_mint: PolicyId,
  tag_spend: ScriptHash,
  self: Transaction,
) -> TagInputSituation {
  let tags =
    utils.asset_list_input(self)
      |> list.filter(fn((_, (policy, _, _))) { policy == tag_mint })
  trace @"The tags must be at least one.": tags
  when list.length(tags) is {
    0 -> TagInputZero
    2 -> {
      trace @"The tags must be exactly two.": tags
      expect [(address0, (_, tag0, 1)), (address1, (_, tag1, 1))] = tags
      trace @"The tags must be paid to the same address.": address0, address1
      expect address0 == address1
      trace @"The tags must be paid to the tag_spend script.": address0, tag_spend
      expect address0 == Script(tag_spend)
      expect [tag0, tag1] = list.sort([tag0, tag1], bytearray.compare)
      TagInputTwo { lower: tag0, upper: tag1 }
    }
    _ -> TagInputWrong
  }
}

fn tag_output_situation(
  tag_mint: PolicyId,
  tag_spend: ScriptHash,
  contract_spend: ScriptHash,
  self: Transaction,
) -> TagOutputSituation {
  let tags =
    utils.asset_list_output(self)
      |> list.filter(fn((_, (policy, _, _))) { policy == tag_mint })
      |> list.sort(
          fn((_, (_, tag0, _)), (_, (_, tag1, _))) {
            bytearray.compare(tag0, tag1)
          },
        )
  when list.length(tags) is {
    2 -> {
      trace @"The tags must be exactly two.": tags
      expect [(address0, (_, tag0, 1)), (address1, (_, tag1, 1))] = tags
      trace @"The tags must be paid to the same address.": address0, address1
      expect address0 == address1
      trace @"The tags must be paid to the tag_spend script.": address0, tag_spend
      expect address0 == Script(tag_spend)
      expect [tag0, tag1] = list.sort([tag0, tag1], bytearray.compare)
      trace @"The tags must be 00... and ff...": tag0, tag1
      expect
        tag0 == #"0000000000000000000000000000000000000000000000000000000000000000"
      expect
        tag1 == #"ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
      TagOutputTwo { lower: tag0, upper: tag1 }
    }
    3 -> {
      trace @"The tags must be exactly three.": tags
      expect [
        (address0, (_, tag0, 1)), (address1, (_, tag1, 1)),
        (address2, (_, tag2, 1)),
      ] = tags
      trace @"The boundary tags must be paid to the same address.": address0, address1
      expect address0 == address2
      trace @"The boundary tags must be paid to the tag_spend script.": address0, tag_spend
      expect address0 == Script(tag_spend)
      trace @"The tag1 must be paid to the contract_spend": tag0, tag1, tag2
      expect address1 == Script(contract_spend)
      TagOutputThree { lower: tag0, upper: tag2, new: tag1 }
    }
    5 -> {
      trace @"The tags must be exactly five.": tags
      expect [
        (address0, (_, tag0, 1)), (address1, (_, tag1, 1)),
        (address2, (_, tag2, 1)), (address3, (_, tag3, 1)),
        (address5, (_, tag5, 1)),
      ] = tags
      let (lower0, taglower0) = (address0, tag0)
      let (upper1, tagupper1) = (address5, tag5)
      let ((upper0, tagupper0), (lower1, taglower1), (new, tagnew)) =
        if address0 == address1 {
          ((address1, tag1), (address2, tag2), (address3, tag3))
        } else {
          ((address2, tag2), (address3, tag3), (address1, tag1))
        }
      trace @"The tags must be paid to the same address.": lower0, upper0
      expect lower0 == upper0
      trace @"The tags must be paid to the same address.": lower1, upper1
      expect lower1 == upper1
      trace @"The tags must be paid to the tag_spend script.": lower0, tag_spend
      expect lower0 == Script(tag_spend)
      trace @"The tags must be paid to the tag_spend script.": lower1, tag_spend
      expect lower1 == Script(tag_spend)
      trace @"The tags must be paid to the contract_spend script.": taglower0, tagupper0
      expect lower0 == Script(contract_spend)
      trace @"The tag1 must be (tag0+tag3)/2": tag0, upper0, upper1
      let tag0n = bytearray.to_int_big_endian(taglower0)
      let tag1n = bytearray.to_int_big_endian(tagupper0)
      let tag2n = bytearray.to_int_big_endian(taglower1)
      let tag3n = bytearray.to_int_big_endian(tagupper1)
      expect tag1n == ( tag0n + tag3n ) / 2
      trace @"The tag2 must be tag1+1": taglower1, tagupper0
      expect tag2n == tag1n + 1
      TagOutputFive {
        lowerLeft: taglower0,
        upperLeft: tagupper0,
        lowerRight: taglower1,
        upperRight: tagupper1,
        new: tagnew,
      }
    }
    _ -> TagOutputWrong
  }
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
    // =================================================================================================================
    // Checking the STT in the inputs
    // =================================================================================================================
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
    // =================================================================================================================
    // Checking the STT in the outputs
    // =================================================================================================================
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
    // =================================================================================================================
    // Checking the datum in the outputs
    // =================================================================================================================
    trace @"Obtaining the full output UTxO holding the STT..."
    expect [utxo] =
      utils.utxo_list_output(self)
        |> list.filter(fn(u) { u.address == address })
    trace @"The UTxO must contain an inline datum."
    expect InlineDatum(datum_output) = utxo.datum
    trace @"The datum must have type RunDatum."
    expect datum_output: RunDatum = datum_output
    trace @"The field started must be True."
    expect datum_output.started == True
    // =================================================================================================================
    // Checking the datum in the inputs
    // =================================================================================================================
    trace @"The current datum must exist."
    expect Some(datum) = option_datum
    // =================================================================================================================
    // Ensuring tag_mint is called
    // =================================================================================================================
    trace @"The tag minting policy must be called."
    expect self.redeemers |> list.any(fn(pair) { pair.1st == Mint(tag_mint) })
    // =================================================================================================================
    // Obtaining the tag_spend utxo(s) in the outputs
    // =================================================================================================================
    let utxos =
      utils.utxo_list_output(self)
        |> list.filter(fn(u) { u.address == Script(tag_spend) })
    if !datum.started {
      // ===============================================================================================================
      // If NOT started
      // ===============================================================================================================
      trace @"There are no tags in the inputs."
      expect TagInputZero = tag_input_situation(tag_mint, tag_spend, self)
      trace @"There are two tags in the outputs."
      expect TagOutputTwo { .. } =
        tag_output_situation(tag_mint, tag_spend, contract_spend, self)
      trace @"The output utxos of the tag spend script must be exactly one."
      expect [utxo] = utxos
      trace @"The datum must be the tag_spend script's datum."
      expect InlineDatum(data) = utxo.datum
      trace @"The datum must have type TagDatum."
      expect datum: TagDatum = data
      trace @"The datum must have the field pool empty."
      expect datum.pool == []
      True
    } else {
      // ===============================================================================================================
      // If started
      // ===============================================================================================================
      trace @"There are two tags in the inputs."
      expect TagInputTwo { lower: tag0i, upper: tagfi } =
        tag_input_situation(tag_mint, tag_spend, self)
      trace @"The input utxos of the tag spend script must be exactly one."
      expect [utxo] =
        utils.utxo_list_input(self)
          |> list.filter(fn(u) { u.address == Script(tag_spend) })
      trace @"The datum must be the tag_spend script's datum."
      expect InlineDatum(data) = utxo.datum
      trace @"The datum must have type TagDatum."
      expect datum: TagDatum = data
      when tag_output_situation(tag_mint, tag_spend, contract_spend, self) is {
        TagOutputThree { lower: tag0o, upper: tagfo, new: tag } -> {
          trace @"The lower and upper tags must be the same as the input tags.": tag0i, tag0o
          expect tag0i == tag0o
          trace @"The lower and upper tags must be the same as the input tags.": tagfi, tagfo
          expect tagfi == tagfo
          trace @"The new tag must not be in the previous input": tag
          expect list.has(datum.pool, tag) == False
          True
        }
        TagOutputFive {
          lowerLeft: tagll,
          upperLeft: tagul,
          lowerRight: taglr,
          upperRight: tagur,
          new: tag,
        } -> {
          trace @"The lower and upper tags must be the same as the input tags.": tag0i, tagll
          expect tag0i == tagll
          trace @"The lower and upper tags must be the same as the input tags.": tagfi, tagur
          expect tagfi == tagur
          trace @"The new tag must not be in the previous input": tag
          expect list.has(datum.pool, tag) == False
          // TODO: last bit, check if the new tag is in the (correct) pool
          True
        }
        _ -> False
      }
    }
  }

  else(_) {
    fail @"Validator Run only for spending"
  }
}
