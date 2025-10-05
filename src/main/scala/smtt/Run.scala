package smtt

import scalus.*
import scalus.builtin.Data
import scalus.ledger.api.v3.*
import scalus.prelude.{*, given}

@Compile
object Run extends ParameterizedValidator[(PolicyId, PolicyId, ScriptHash, ScriptHash, BigInt)] {
    override def spend(
        params: (PolicyId, PolicyId, ScriptHash, ScriptHash, BigInt),
        datum: Option[Data],
        redeemer: Redeemer,
        txInfo: TxInfo,
        ownOutRef: TxOutRef
    ): Unit = {
        fail("TODO: implement Run")
    }
}
