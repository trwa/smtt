import { Data } from "https://deno.land/x/lucid@0.10.7/src/mod.ts";
import { TSchema } from "https://deno.land/x/typebox@0.25.13/src/typebox.ts";

export const fromSchema = <T extends TSchema>(x: T) =>
    x as unknown as Data.Static<T>;
