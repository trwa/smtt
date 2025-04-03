import {Lucid, UTxO,} from "https://deno.land/x/lucid@0.10.7/src/mod.ts";
import {scriptGetAllUtxos,} from "../src/script.ts";
import {Validator} from "./internal/validator.ts";

export class Contract extends Validator {
    constructor(lucid: Lucid, path: string, title: string) {
        super(lucid, path, title);
    }

    public async run(keys: string[]): Promise<UTxO[]> {
        return await scriptGetAllUtxos(this.lucid, this.script);
    }
}
