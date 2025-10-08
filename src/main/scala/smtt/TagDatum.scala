package smtt

import scalus.Compile
import scalus.builtin.{ByteString, Data, FromData, ToData}
import scalus.prelude.List

case class TagDatum(pool: List[ByteString]) derives FromData, ToData

@Compile
object TagDatum;
