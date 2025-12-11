package smtt

import scalus.*
import scalus.builtin.ByteString
import scalus.ledger.api.v3.*
import scalus.prelude.*
import scalus.prelude.Option.{None, Some}

@Compile
object STT extends ParameterizedValidator[TxOutRef]:
  // Ported from Aiken's State Thread Tokens example:
  // https://aiken-lang.org/fundamentals/common-design-patterns#state-thread-tokens-aka-stt
  override def mint(
      paramOneTimeInvocationProof: TxOutRef,
      _redeemer: Redeemer,
      policyId: PolicyId,
      txInfo: TxInfo
  ): Unit = (
    for {
      // Ensure the UTxO identified by `txOutRef` is consumed by this transaction.
      input <- Utils.findInput(txInfo.inputs, paramOneTimeInvocationProof)
      // Ensure exactly one "STT" token is minted from this policyId and nothing else.
      mintedTokens <- txInfo.mint.toSortedMap.get(policyId)
      mintedTokens <- if mintedTokens.size == BigInt(1) then Some(mintedTokens) else None
      assetName = ByteString.fromString("STT")
      amount <- mintedTokens.get(assetName)
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
    } yield result
  ).getOrElse(fail("Could not find the required minting conditions."))
