import {Data} from "https://deno.land/x/lucid@0.10.7/src/mod.ts";
import {fromSchema} from "./utils.ts";

const StartScriptRedeemer = fromSchema(
    Data.Object(
        {
            kv_list: Data.Tuple([Data.Bytes(), Data.Nullable(Data.Bytes())]),
        },
    ),
);

/**
 * Create a redeemer for the start script
 * @param kvList - List of key-value pairs
 */
export function startScriptRedeemer(kvList: [string, string | null]) {
    return Data.to({ kv_list: kvList }, StartScriptRedeemer);
}

/**
 * Create a redeemer for the extend script
 * @param kvList - List of key-value pairs
 */
export const extendScriptRedeemer = startScriptRedeemer;
