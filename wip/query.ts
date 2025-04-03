import {C, TxSigned} from "https://deno.land/x/lucid@0.10.7/src/mod.ts";
import {queryTx, getLucidInstance} from "../src/common.ts";

if (import.meta.main) {
  const query = queryTx();
    //const response = await query("3223077ff02f57a4806515755d336d452bc8ab17d5d646f2bb9f35140025064a");
    //console.log("Response: ", response);
    // read the response
    //const json = await response.json();
    //console.log("JSON: ", json);

    //const tx = C.Transaction.from_json(json);
    //console.log("Tx: ", tx);



}
