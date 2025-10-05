package smtt

import scalus.*
import scalus.ledger.api.v3.*
import scalus.prelude.{*, given}

@Compile
object Stt extends ParameterizedValidator[TxOutRef] {
    override def mint(
        txOutRef: TxOutRef,
        redeemer: Redeemer,
        policyId: PolicyId,
        txInfo: TxInfo
    ): Unit = {
        fail("TODO: implement Stt")
    }
}
