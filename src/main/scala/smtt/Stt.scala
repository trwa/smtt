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
      txOutRef: TxOutRef,
      _redeemer: Redeemer,
      policyId: PolicyId,
      txInfo: TxInfo
  ): Unit =
    val result: Option[Unit] = for {
      // Ensure the UTxO identified by `txOutRef` is consumed by this transaction.
      input <- Utils.findInput(txInfo.inputs, txOutRef)
      // Ensure exactly one "STT" token is minted and nothing else.
      tokens <- txInfo.mint.toSortedMap.get(policyId)
      tokens <- if tokens.size == BigInt(1) then Some(tokens) else None
      amount <- tokens.get(ByteString.fromString("STT"))
      result <- if amount == BigInt(1) then Some(()) else None
    } yield result
    result.getOrElse(fail("Could not find the required minting conditions."))
