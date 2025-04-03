import { Data } from "https://deno.land/x/lucid@0.10.7/src/mod.ts";
import { fromSchema } from "./utils.ts";

export const StartDatum = fromSchema(
    Data.Object(
        {
            keys: Data.Array(Data.Bytes()),
        },
    ),
);

export const ContractDatum = fromSchema(
    Data.Object(
        {
            key: Data.Bytes(),
        },
    ),
);
