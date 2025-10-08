package smtt

import scalus.*
import scalus.builtin.ByteString
import scalus.ledger.api.v3.*
import scalus.prelude.Option.{None, Some}
import scalus.prelude.{*, given}

@Compile
object Stt extends ParameterizedValidator[TxOutRef]:
  // Ported from Aiken's State Thread Tokens example:
  // https://aiken-lang.org/fundamentals/common-design-patterns#state-thread-tokens-aka-stt
  override def mint(
      oneTimeProof: TxOutRef,
      _redeemer: Redeemer,
      sttPolicyId: PolicyId,
      transaction: TxInfo
  ): Unit =
    val status: Option[Unit] = for
      // Ensure the UTxO identified by `txOutRef` is consumed by this transaction.
      input <- Utils.findInput(transaction.inputs, oneTimeProof)
      // Ensure exactly one "STT" token is minted from this policyId and nothing else.
      tokens <- transaction.mint.toSortedMap.get(sttPolicyId)
      tokens <- if tokens.size == BigInt(1) then Some(tokens) else None
      sttAssetName = ByteString.fromString("STT")
      amount <- tokens.get(sttAssetName)
      result <- if amount == BigInt(1) then Some(()) else None
    // Ensure the output containing the "STT" token has empty datum.
    /* TODO: REMOVE! Not so useful...
      sttRecipient <- transaction.outputs.find(output =>
        val found = for
          tokens <- output.value.toSortedMap.get(sttPolicyId)
          amount <- tokens.get(sttAssetName)
        yield amount == BigInt(1)
        found.getOrElse(false)
      )
      datum: RunDatum <- sttRecipient.datum match
        case OutputDatum(datum) => Some(datum.to[RunDatum])
        case _                  => None
      valid <- if !datum.started then Some(()) else None
     */
    yield result
    status.getOrElse(fail("Could not find the required minting conditions."))
