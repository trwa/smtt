import {UTxO} from "https://deno.land/x/lucid@0.10.7/src/types/types.ts";
import {scriptApplyStringParam,} from "../src/script.ts";
import {Lucid} from "https://deno.land/x/lucid@0.10.7/src/lucid/lucid.ts";
import {Validator} from "./internal/validator.ts";
import {Contract} from "./contract.ts";
import {Data} from "https://deno.land/x/lucid@0.10.7/src/mod.ts";
import {StartDatum} from "./internal/datum.ts";

export const makeStartDatum = (keys: string[]) => Data.to({ keys: keys }, StartDatum);

export class Start extends Validator {
    constructor(
        public lucid: Lucid,
        public path: string,
        public title: string,
        contract: Contract,
    ) {
        super(lucid, path, title);
        this.script = scriptApplyStringParam(this.script, contract.getAddress());
    }

    public async run(keys: string[]): Promise<UTxO[]> {
        return await this.lucid.utxosAt(this.getAddress());
    }
}
