import {SpendingValidator} from "https://deno.land/x/lucid@0.10.7/src/types/types.ts";
import {Lucid} from "https://deno.land/x/lucid@0.10.7/src/lucid/lucid.ts";
import {scriptFromJson} from "../../src/script.ts";

export class Validator {
    protected readonly lucid: Lucid;
    protected script: SpendingValidator;
    constructor(lucid: Lucid, path: string, title: string) {
        this.script = scriptFromJson(path, title);
        this.lucid = lucid;
    }
    public getAddress(): string {
        return this.lucid.utils.validatorToAddress(this.script);
    }

    public getScript(): SpendingValidator {
        return this.script;
    }
}
