package smtt

import scalus.*
import scalus.cardano.ledger.AssetName
import scalus.ledger.api.v3.*
import scalus.prelude.Option.Some
import scalus.prelude.{*, given}

@Compile
object Stt extends ParameterizedValidator[TxOutRef]:
    override def mint(
        txOutRef: TxOutRef,
        _redeemer: Redeemer,
        policyId: PolicyId,
        txInfo: TxInfo
    ): Unit =
        if !inputParamIsSpent(txInfo.inputs, txOutRef) then
            fail("The output reference parameter is not consumed by the minting transaction.")
        val mintedTokens = getOutputMintedTokens(txInfo.outputs, policyId)

    private def inputParamIsSpent(inputs: List[TxInInfo], txOutRef: TxOutRef): Boolean =
        Utils.findInput(inputs, txOutRef) match
            case Some(_) => true
            case _       => false

    private def getOutputMintedTokens(
        outputs: List[TxOut],
        policyId: PolicyId
    ): SortedMap[AssetName, Long] = {
        flatMap(outputs.map(_.value.toSortedMapget(policyId))) match
            case Some(assets) => assets
            case _            => SortedMap.empty[AssetName, Long]
        fail("TODO: implement")
    }
