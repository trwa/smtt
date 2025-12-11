package smtt

import scalus.*
import scalus.builtin.{ByteString, Data}
import scalus.ledger.api.v3.*
import scalus.prelude.*
import scalus.prelude.Option.{None, Some}

@Compile
object Tag extends ParameterizedValidator[PolicyId] {
  // Ensure "STT" is in inputs (delegate all logic to Run validator)
  override def mint(
      paramSttPolicyId: PolicyId,
      _redeemer: Redeemer,
      _policyId: PolicyId,
      txInfo: TxInfo
  ): Unit =
    checkSttIsInInputs(txInfo, paramSttPolicyId)

  private def checkSttIsInInputs(txInfo: TxInfo, sttPolicyId: PolicyId): Unit = {
    if txInfo.inputs
        .filter(input => {
          input.resolved.value.toSortedMap.get(sttPolicyId) match
            case None => false
            case Some(tokens) =>
              tokens.get(ByteString.fromString("STT")) match
                case None         => false
                case Some(amount) => amount == BigInt(1)
        })
        .length != BigInt(1)
    then fail("STT token holder not found or multiple found")
  }

  // Ensure "STT" is in inputs (delegate all logic to Run validator)
  override def spend(
      sttPolicyId: PolicyId,
      _datum: Option[Data],
      _redeemer: Redeemer,
      txInfo: TxInfo,
      _ownOutRef: TxOutRef
  ): Unit = checkSttIsInInputs(txInfo, sttPolicyId)
}
