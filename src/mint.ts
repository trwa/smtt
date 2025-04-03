import {getLucidInstance, serializeDatum} from "./common.ts";
import {fromText, Hasher} from "https://deno.land/x/lucid@0.20.4/src/mod.ts";
import {Data, Lucid, Script} from "https://deno.land/x/lucid@0.20.4/mod.ts";
import {makeKey32, makeRandomId, makeStorage, waitSeconds} from "./single.ts";
import {BenchmarkLocalSpend, BenchmarkStorage, BenchmarkTokenMint,} from "../benchmark/plutus.ts";
import {parse, stringify} from "jsr:@std/csv";

function makeAsset(policy: Script, name: string, amount: bigint) {
  const policyId = Hasher.hashScript(policy);
  const unit = policyId + fromText(name);
  return { [unit]: amount };
}

async function mintKeys(lucid: Lucid, nKeys: number) {
  const policy = new BenchmarkTokenMint();
  let tx = lucid
    .newTx()
    .attachScript(policy);
  for (let i = 0; i < nKeys; i++) {
    const name = makeKey32(i);
    const asset = makeAsset(policy, name, 1000n);
    tx = tx.mint(asset, Data.void());
  }
  const txComplete = await tx.commit();
  const signedTx = await txComplete.sign().commit();
  const txHash = await signedTx.submit();
  console.log("tx hash: ", txHash);
}

async function fundMulti(
  lucid: Lucid,
  id: string,
  chunkSize: number,
  nChunks: number,
) {
  const policy = new BenchmarkTokenMint();
  const policyId = Hasher.hashScript(policy);
  const scriptSpend = new BenchmarkLocalSpend(
    fromText(id),
    policyId,
    BigInt(chunkSize),
    BigInt(nChunks),
  );
  const address = lucid.utils.scriptToAddress(scriptSpend);

  let tx = lucid
    .newTx();

  for (let i = 0; i < nChunks; i++) {
    const storage: BenchmarkStorage = makeStorage(chunkSize);
    const datum: string = serializeDatum(storage, BenchmarkLocalSpend.datum);
    const key = makeAsset(policy, makeKey32(i), 1n);
    tx = tx.payToContract(
      address,
      { Inline: datum, scriptRef: scriptSpend },
      key,
    );
  }

  const txComplete = await tx.commit();
  const txSigned = await txComplete.sign().commit();

  return await txSigned.submit();
}

async function spendMulti(
  lucid: Lucid,
  id: string,
  chunkSize: number,
  nChunks: number,
) {
  const policy = new BenchmarkTokenMint();
  const policyId = Hasher.hashScript(policy);
  const scriptSpend = new BenchmarkLocalSpend(
    fromText(id),
    policyId,
    BigInt(chunkSize),
    BigInt(nChunks),
  );
  const address = lucid.utils.scriptToAddress(scriptSpend);
  const utxos = await lucid.utxosAt(address);

  console.log("n.utxo ", utxos.length);
  if (utxos.length === 0) {
    throw new Error("no utxo");
  }

  const redeemer = Data.void();
  let tx = lucid.newTx()
    .collectFrom(utxos, redeemer);

  for (let i = 0; i < nChunks; i++) {
    const storage: BenchmarkStorage = makeStorage(chunkSize);
    const datum: string = serializeDatum(storage, BenchmarkLocalSpend.datum);
    const key = makeAsset(policy, makeKey32(i), 1n);
    tx = tx.payToContract(
      address,
      { Inline: datum, scriptRef: scriptSpend },
      key,
    );
  }

  const txComplete = await tx.commit();
  const txSigned = await txComplete.sign().commit();
  return await txSigned.submit();
}

const text = `
id,nChunks,chunkSize,hash
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,10,5,40bcf09502a95a89ff08a56fc2b8771c0ebc59dcd231581d7116ed80e9a0e573
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,10,4,8f592a73790b76714d60fdb4663fb1a23c51ea90464814db6d57606c7dc17a7b
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,10,3,84f849648097426156d0cb81c9fcc6e9755ffe3e88b6ad554c66190accb0e03d
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,10,2,7e32a6b35473545cf678f68dad89ee5ce051f9b519ef4f313a08e65e7359aee8
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,10,1,9a183d9fc8a1fac3a44449dab384ea72fe9ea96841e60750a5a136f5d20fc987
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,9,5,ec9cdece3b18252c61ddffe2ff9c5eb8a350bea8b7ccb5ad063ff224ae9fd4da
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,9,4,b3f14580a94e00358657997e2d715f0323fdd152c3cbe09fb276f682723fd775
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,9,3,a59cf4db258a678df5690b17989e39a898247ea182c4bf5c1b9b81d022b1808c
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,9,2,ff99e8fd5aed88a788ec41d96d4e02cca1590213168136002a75059e2e68bf02
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,9,1,076cbafbdef1eb21aea50580f26c372f594c920e03940a014d2b4836ce5d0395
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,8,6,74bcbf01da808fe0dafa9e127e6d71c77457b5340f133f4363b461e236d504af
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,8,5,4421f7035111800fc1014cc0823147732940663bba45e23fb4626579c2dddd90
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,8,4,c735317487cf0574b3c5cc7806bb87466fac915fb527fc28497984c4ab1d46be
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,8,3,df8e15a316718c7bf9446da0a2cd54268497d5565d1d2667e26888ec0bb607c2
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,8,2,b3b5b2259032edf0b48464cde31269dcc37797481bfcdd0032457d807a93c134
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,8,1,51e15d56938fe5da3cf521d413170c3b3461f02f8c27f4cb2355796660d2bd7b
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,7,7,403fec053b1aca60303625cefe1075a0e4ae336c6dbdd668f38d6f663f0904ae
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,7,6,3b387e6095356d1a404eb19b8c20def92924579cdffd1652ee76af9fb4fee381
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,7,5,5d3d480baa43d292a7abb1ad7d43dc4889f49a562860f73a28ee842f5c524518
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,7,4,aa6ab51af4627c3a136b52d6909e5c0513181f25721753933e71afe385fd5827
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,7,3,d312a372886a8aa39a1e46104602194a176e7874a79a3c4fbbb3db75d89fcbf0
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,7,2,d19f211c1be1b43ecb346ecd3d530af3a9a911c6137f13d058650d66ab424983
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,7,1,7a09eae85583ae9765081343287c4f868ef1e0e60bb24d115e094d1eed6f9d51
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,6,8,7af3fcb989dec736c062a4bdc05af538ad1e35b508cf8c6248dfd1ad3897cff9
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,6,7,53f79bfd0f7bd4cb3de0be1a198f11c7d1c0d7ecb114a8eddc277c4e6da15441
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,6,6,e9a3fbc5269fb260a81bff42bf9adb6c9c65320c92539b5cfd1344c232e406b5
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,6,5,a05257e08bb2946c4cc5940ff6ad2a2ddaa3f447168102889d13b740e1b9c016
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,6,4,74cacfcd2aba89298e7c2a6e06c9cb1086e89abced98e1725d8bd25fde1505c0
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,6,3,01e93eb9ae5877581d65bdbd2918e12289f5624d26e2e34c0d2466fe9a762e20
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,6,2,62c910fc3799f3d56cd08f167ec26a22d2cd32b1274017bf0aad92f2eca36559
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,6,1,6532cd277ad60ab4bc1efeb25b4405a32413976ebaec901cb8deaa9d98b8a67f
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,5,10,0836e2ce673dcb7ebddace246ac49b74f62b686b8ee8fc953c9b8f1df92d28d4
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,5,9,618995ca3b44d800a906bdbe694cd7d734be5e414d156f48121f4b7796143244
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,5,8,d9a33af982cf3f22824f04a8e5049ac47362853e7f70e6d8976b7c1d2cd96887
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,5,7,d9684ebf48cea535fa164df6f95dbe82c18c87d69724cb83100d4f269168f4a5
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,5,6,05c7cdcdb19f60403699a927db39f93931adcc8a6b3a5251177a359b6416561f
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,5,5,fad798717804c7a5ef746f5237a788fffa626c3a32f2264dcc491433fafdca65
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,5,4,cd19c831f13f7f00acd8841e245da37c3ac7d7538754bd208189c09871a7d351
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,5,3,36ae2aec67d8dcc7bcf3d958d1d9aff7844a08d9c57404733a7dae57b4a6e91b
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,5,2,357fbc7b288472acbae6ae2afd163a227eb0c5b9fa2eeee774563f51bacdec85
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,5,1,e986a2b109b8536a675f6be78e3c25a29e2443f23c62ed9258d4f4e50099e66f
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,4,10,1f6ffd6ff4c525461d9c50af7ddb528d69beffda66a1209b0f2f335d933355d9
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,4,9,f3b4cac9fe5ab3aa5e5d9df7a4cce507809b4e0a2fcb0a974e54f4a4c1e20925
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,4,8,5f4d73002b1147af0ab2f4c32e44a89c1cfcd2eb9e6034f23f8957d21e7774df
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,4,7,6730a4bc1eeafde3d49c8b3cdaac9704e9ba605522efcfc900a842402aecf981
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,4,6,42d675bddeb9efc6bfc042c60b11dac6e6df6a6b5a759fcf1c9834c9c25c0958
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,4,5,4627f8876b23472bde408f94f754ff5199c41d584d5cd5814a87194311bc5877
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,4,4,04c464860fa4c9f44792706daeeb895c3f6b0fe9f5978ffea0865faa5130953b
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,4,3,41c81fbe8c542e84c7c77227e900f5af5806c673415bd98760361f27d2387c01
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,4,2,20aeec551931622303c860f5018e91b92a973d385e5eb1316feee2394fcdf565
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,4,1,0b5b7440036542f00b8c98274a65c605ff98efe42b97fa47f609d3c05355e2e7
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,3,10,97c4a868973e4f1ad98c0c0a6cd778d13f668e3b22f98a0a004b19925b91d5ce
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,3,9,af970bd56be177e4dcd75813dfc8d1344f9912d66df221a248d35dddc507aa79
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,3,8,bbdd00c1a421cd0c386274f4f69c5319a924b01f0b219d9f54725dab3313e912
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,3,7,0dbbdca221766282c3091da34324cdfa0d5f638ff67b1b1988feff58e37a4675
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,3,6,cb2630fc8c7d9ff106d74c8437546ac7db10d95c3f8654b93f56d7e8c96356af
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,3,5,36d9703c9616438b64f59d400685706025741a46b3f3bad766ec4976bbee02c9
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,3,4,9b83f3fec4b61e16cc1652a40c3dbd59f3e83c375cf4b27b2588bfabaa11d53d
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,3,3,94b0ebb10a78b980e48bd1ded9fe51ff1691744da5efc2d855c388dd99440450
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,3,2,43b4341e4e245168611876b2af660e6b6754bdc2331d7da78b702a0f341970b5
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,3,1,f9523510001efe97357d05de033033d4ebc6a31d90f45789dd3510127231406c
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,2,20,a0e16e15884ef1c376b2c303afd69923d56ab7b2d8f0a0ed7b8aa1afe336d02e
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,2,10,30a8e0255c8cb51e10369ef58f0ad45a948f0f8dfa4c194c39309b7cba305cb6
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,2,9,8eb2b226a06c436acfe5655f8f6fea11ed9ab66a65a59d35897fd9e764e1feca
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,2,8,bb60161f3b75dddeb2d95bf772e73181c49bea66bbf027eee503bdf309a74c6e
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,2,7,becd8e82132138845877cbcd84cb67f467473a20f3bc0ea736f0b1288461e2d8
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,2,6,12b142c06e8ef6994cc7e89d1fcc065c4415a015319fb34e0aa21c123c68e2f1
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,2,5,34b03e71e23b370911b9d355276e8535cebf3874ccf75d2599e5d8e35cd9709a
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,2,4,6af3b323a702c28e9703383ae0600412b78898213781f3b59ba92d9a4786e788
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,2,3,f769ccf8b25f3b4f25569a7883d8007dc0b4675496eb2d1adeb2dae917eecac6
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,2,2,0f23d6fe63d1db74c0e106d473d8d48fc05dd797ad82a1ba0d636ff55af25fa2
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,2,1,a5d5927e51478d5fb3a5858216de57d6ddcca67ebb564acfd540b195a4ff7ce2
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,1,50,a1176b2ae61e299d834dae59abe8d8cfefa69c10b5de74f148f931ba583021af
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,1,40,9fa1d361fc3055f6cdb7b92940be7df05cf8e62976e5ffb930ec55ad802e0a10
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,1,30,afcb855c9d663c4b4a229f2e58208af15ac25eaeafde77679b0dede2b5c95479
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,1,20,07bebcf8188c701bc05290d1f2436b89331a4afc000626eb59b2063a87c37d10
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,1,10,55ebcf29459fc1304cb69cbe4821526fa3433cff4f475b2e189fb2e996524222
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,1,9,4f56be58a101aecec11a2f843210e7fb7796570c81c543791e7b30f1d3a0f7da
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,1,8,8355760a570d61d6b79d877e072b340be353865baa393aeabc09d80f3e1f1b55
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,1,7,17710d6192955a02f6e6d1295e31bb7fb6630ca9c3fa6b50e3977517a63e07f9
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,1,6,02eaba90296d2a9587d4cf566ba5b82c909548a256926e36824ef80030a2e340
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,1,5,10632e501ab59d4558408c561708d023e44742b70adce76fd6789d0cf044f6e8
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,1,4,cae3ad5404e489da4a248d9ccb4551c001e52d53528f859cf6d65edbaa473f10
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,1,3,b3bb7715394cee4d18c8529c3a8b7e7273df0ac4055f7bfbfef37a0c5338bf3e
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,1,2,b9177922b90003ee796f893ebddbc01bfb75ae21923ce10de4b1b2ebee61a7ca
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,1,1,f5da7a3f15101fd1f65634d427a5ef247690171f2797cba8e5488865dcfbac33
`;

if (import.meta.main) {
  const lucid = getLucidInstance();
  const id = makeRandomId();
  const delay = 60;

  /*
  const nKeys = 20;
  console.log("minting...");
  await mintKeys(lucid, nKeys);
  await waitSeconds(60);
  */

  const fundings = parse(text, {
    columns: ["id", "nChunks", "chunkSize", "hash"],
    skipFirstRow: true,
  });
  console.log(fundings);
  const transactions: Array<
    { id: string; nChunks: number; chunkSize: number; hash: string }
  > = [];

  const nChunks = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
  const chunkSize: number[] = [];
  for (let i = 100; i >= 10; i -= 10) {
    chunkSize.push(i);
  }
  for (let i = 9; i >= 1; i -= 1) {
    chunkSize.push(i);
  }

  /*
  let nci = 0;
  while (nci < nChunks.length) {
    let csi = 0;
    while (csi < chunkSize.length) {
      try {
        const cs = chunkSize[csi];
        const nc = nChunks[nci];
        const size = cs * nc;
        if (size <= 50) {
          const hash = await fundMulti(lucid, id, cs, nc);
          console.log(
            `[nChunks ${nc}] [chunkSize ${cs}] fund with storage ${size}`,
          );
          transactions.push({
            id: id,
            nChunks: nc,
            chunkSize: cs,
            hash: hash,
          });
          await waitSeconds(delay);
        } else {
          console.log(`[nChunks ${nc}] [chunkSize ${cs}] size ${size} > 100`);
        }
        csi += 1;
      } catch (e) {
        const msg = `${e}`;
        if (
          msg.startsWith("Error: Maximum transaction size: expected max 16384")
        ) {
          console.log(
            `[nChunks ${nChunks[nci]}] [chunkSize ${chunkSize[csi]}] ${msg}`,
          );
          csi += 1;
        } else {
          console.error(`retrying... ${e}`);
          await waitSeconds(delay);
        }
      }
    }
    nci += 1;
  }

   */

  let i = 0;
  while (i < fundings.length) {
    const id = fundings[i].id;
    const nChunks = parseInt(fundings[i].nChunks);
    const chunkSize = parseInt(fundings[i].chunkSize);
    try {
      const hash = await spendMulti(lucid, id, chunkSize, nChunks);
      console.log(
        `[nChunks ${nChunks}] [chunkSize ${chunkSize}] spend`,
      );
      transactions.push({
        id: id,
        nChunks: nChunks,
        chunkSize: chunkSize,
        hash: hash,
      });
      await waitSeconds(delay);
      i += 1;
    } catch (_) {
      console.error("retrying...");
      await waitSeconds(delay);
    }
  }

  const csv = stringify(transactions, {
    columns: [
      "id",
      "nChunks",
      "chunkSize",
      "hash",
    ],
  });
  console.log(csv);
}
