package smtt

import scalus.Compile
import scalus.builtin.{Data, FromData, ToData}

case class RunDatum(started: Boolean) derives FromData, ToData

@Compile
object RunDatum;
