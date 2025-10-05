package smtt

import scalus.*
import scalus.builtin.Data
import scalus.ledger.api.v3.*
import scalus.prelude.{*, given}

@Compile
object Tag extends ParameterizedValidator[PolicyId] {
    override def mint(
        sttPolicyId: PolicyId,
        redeemer: Redeemer,
        policyId: PolicyId,
        txInfo: TxInfo
    ): Unit = {
        fail("TODO: implement Tag")
    }

    override def spend(
        sttPolicyId: PolicyId,
        datum: Option[Data],
        redeemer: Redeemer,
        txInfo: TxInfo,
        ownOutRef: TxOutRef
    ): Unit = {
        fail("TODO: implement Tag")
    }
}
