import {queryTx} from "./common.ts";
import {parse, stringify} from "jsr:@std/csv";
import {waitSeconds} from "./single.ts";

const single_fund = `
id,size,hash
xnvHfdf2D4rk4jnIoyLLkXrxyVWgt6t2,1,e39c49d289352a6482c7edbfeddc4a680ff75e0366baaff5aa6bafc52abd9ac6
xnvHfdf2D4rk4jnIoyLLkXrxyVWgt6t2,2,4a662dbded5052d1a185878f1de55c0b13cf5bf2032eb95e75ad88afeea1371b
xnvHfdf2D4rk4jnIoyLLkXrxyVWgt6t2,3,cb493804147ad3513e33a9245d24118d657a3f96225c11e9289fd55f385aaa14
bqnuC2Vv2A3JEWfGLA8ThcRmJ7Xz03h4,4,9e0c040e75aabb0fb74f51f4e4584a5a3f0c15199b581dbc24bac0981421d440
bqnuC2Vv2A3JEWfGLA8ThcRmJ7Xz03h4,5,62894429e5a7fefdee70b801384360740a10d669720e330bddc28d002c5b5777
bqnuC2Vv2A3JEWfGLA8ThcRmJ7Xz03h4,6,509e3ad985094840ab9649711a196115855fac62ad57a16499eb0d10eee58673
bqnuC2Vv2A3JEWfGLA8ThcRmJ7Xz03h4,7,09223313c23e2e622dd38b2bb969b2b327bc9b727561a8ba42cd56f226c45f70
bqnuC2Vv2A3JEWfGLA8ThcRmJ7Xz03h4,8,155e71a567d2134863c525ae8c94b7cc495c9ccb7893ba0bd9423d6f82c7d497
bqnuC2Vv2A3JEWfGLA8ThcRmJ7Xz03h4,9,d3c02e8d2c84f013ef968d76e6b2c18bdd1ab970884895777821f293c9f70a06
VjbQ5sBnPLu5USiAT8LR8dJmMRYZsqdU,10,a8ad4b5e76688cda0c586485b5ebe6f3c663bffdd31581d639e4cbb461190bd4
VjbQ5sBnPLu5USiAT8LR8dJmMRYZsqdU,20,2a6842b8b41fdb13b99f100124cedba1001bd9aa92fe9381b347606566b59d85
VjbQ5sBnPLu5USiAT8LR8dJmMRYZsqdU,30,09bca3ba110b2642b1344f25ec0d36381dca6b0f7131424cc595885b95fea999
VjbQ5sBnPLu5USiAT8LR8dJmMRYZsqdU,40,d07ff763309250e2621376fe4658a1eafa8e653625b30b2238c05de2bbb7e9bd
VjbQ5sBnPLu5USiAT8LR8dJmMRYZsqdU,50,105af820d22cf8e6e07fdba3ba07f39b3ee42da6d7d04087192440720f1f74d0
VjbQ5sBnPLu5USiAT8LR8dJmMRYZsqdU,60,825ec20708762ceb4b8a675483d9367193077ab4290389fefe9d25b7171085ec
VjbQ5sBnPLu5USiAT8LR8dJmMRYZsqdU,70,49960cfaea5ad38de9775381ee3b46420a969d221ebc2718cde846dd85db188d
VjbQ5sBnPLu5USiAT8LR8dJmMRYZsqdU,80,d4157f0a9edcf6dc101b9afe9743e2a3f00f4a090ae4ce429a79ca218ee60cd7
VjbQ5sBnPLu5USiAT8LR8dJmMRYZsqdU,90,775cbb2f1610ffe15292b0901aa4fa581a45654b86a4bf45c17b04c639ecf709
BxtSBSw0j0Yz4nQgOWbLvi75YhogR5xt,100,a302e06da1bfd0ba3f5613c70a24722c8244e3e49ed513278547c5fe19e7a69a
`;

const single_run = `
id,size,hash
xnvHfdf2D4rk4jnIoyLLkXrxyVWgt6t2,1,87e56e2ef35640444434dbe7d090f8515b3b2db42ada9898fdd28279a0d3c100
xnvHfdf2D4rk4jnIoyLLkXrxyVWgt6t2,2,9e4354d4d276f8b9f166bd810dfca56dabd52c21f326e5f156b1361f792f90c3
xnvHfdf2D4rk4jnIoyLLkXrxyVWgt6t2,3,32aa5673173b606cf1edd90cd4919f72a830d49812a278108c68dcc40256dc1e
bqnuC2Vv2A3JEWfGLA8ThcRmJ7Xz03h4,4,d39782559c18aae2a4342eb6724e293bd8e3e2226433c91fc8867420929b456d
bqnuC2Vv2A3JEWfGLA8ThcRmJ7Xz03h4,5,a14e7559e06970bda872ff99d8993adfed42941b56a7cc98dfde60151eb380fc
bqnuC2Vv2A3JEWfGLA8ThcRmJ7Xz03h4,6,4f08b2f5c3451e27f72331c343b67f991d75499b6d52ca40d0a03c693de1ff92
bqnuC2Vv2A3JEWfGLA8ThcRmJ7Xz03h4,7,c927f8322bc60cc1d58beafa646293172a0d18509f51e7913939cd7adc71f50f
bqnuC2Vv2A3JEWfGLA8ThcRmJ7Xz03h4,8,67d57c1ee197ac86f01d166da3cb9a02e82369802d7c41915cab73e7b41a8ead
bqnuC2Vv2A3JEWfGLA8ThcRmJ7Xz03h4,9,73469042d0b86b413e0dd3dfd908dfbe1b813c6833e4f79cea1bc5313f1a63db
VjbQ5sBnPLu5USiAT8LR8dJmMRYZsqdU,10,c52e927bbfdba247b3527f61b8e0534b4a044e967787aa0129012ccb230466c8
VjbQ5sBnPLu5USiAT8LR8dJmMRYZsqdU,20,1d45b5c66bbc582a832a410057865cbb144bf2240fbbbdd9dd2f3c83270301e4
VjbQ5sBnPLu5USiAT8LR8dJmMRYZsqdU,30,92a0f2aeb5384fe2d146d96cb9645d81d292a67345df1b25d1bdae87ae0d29d8
VjbQ5sBnPLu5USiAT8LR8dJmMRYZsqdU,40,cbfeedfb5d684f3120157cde266b5e91536f537a55f74aa590daf8a9549c0e6e
VjbQ5sBnPLu5USiAT8LR8dJmMRYZsqdU,50,6842af62b7090fe03a6917e7cdb8724c87ae07587b5ea9f5e9cd482bc439b563
VjbQ5sBnPLu5USiAT8LR8dJmMRYZsqdU,60,b95f446e62bb8914bc316ed32c0e6e11a023ded5d86eb1687357a7d16a1dfe6b
VjbQ5sBnPLu5USiAT8LR8dJmMRYZsqdU,70,b0873ed9db70aa7f6aec37ec863e9e05975f4d30f74f5e4b99b00db03bbe4ef8
VjbQ5sBnPLu5USiAT8LR8dJmMRYZsqdU,80,9f41db599b5bbd7a0ad7f20c1600472dc0a6e682772e57dcb3d002f32a1059fe
VjbQ5sBnPLu5USiAT8LR8dJmMRYZsqdU,90,7f998982646b4532235f1a45084214742122cec21834642505cfcc3f6d80336c
BxtSBSw0j0Yz4nQgOWbLvi75YhogR5xt,100,cf88f1f2ca4d3bc496cc3c62da8e65081ebb9d58a7a2eff6eb8f09261cf6abf4
`;

const multi_fund = `
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

const multi_run = `
id,nChunks,chunkSize,hash
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,10,5,000e26779a24e5a6249989fd5adbb09f56a4f40a73a514d111110f2a31cfbfed
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,10,4,b7af44e693e5978a5bd8e6d68016b59f3b4269622fd6dc4045e190218f9fae87
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,10,3,f510d8b998ef6b7a72c92caaa9e1c8497d5d7ff178ceed05c45f1741c61f7ce8
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,10,2,4adbc2ce9bf92285d0b93ff4cb26616803b60e98ded6719fcd7f185b987587fd
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,10,1,a3ba626434f31831c03ab0cf7d69069e17c5fb0a2ba5c19b13571753daccb030
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,9,5,0e699cee3a317aa288a855802d2e67b285df6710d6d346812ad211d05a4d9f6d
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,9,4,5e2922932e88aca985705870e815b088c2286a569b8eb6b0fe5a2580121cb0e5
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,9,3,1dedee4fc2ee39b3b34c54e4b89e1a7e7c8749e5c1df76164128509ac9406e52
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,9,2,7dc5aac9905815053fa72de668dfddb38a1e5624932ce7cfe0219f6da720bd32
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,9,1,db28a5254190add06aaa78330cc248d18c564bac7eb5090cb3a48acf85ee8da2
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,8,6,07f503cba7e11f265c4d32b038cc12f98785eaa8490ec076ca7b57971d977d99
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,8,5,15fba335d4fb3cf68122eb89e9af2b9a6ff8f2226be5e4d6367cc79364010856
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,8,4,125ddb4be05195ace63c7e883e686d68d709c53f1cc673c2a2b2a5a38abcb4f0
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,8,3,64ca51ae03c1c106a877ba22bc95a0ea5afa9cea6bc8aabb7566ee46041b587c
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,8,2,358a70e35ba915ec7fa20a0c4aaa225314f24d5195f15015911415771cac9676
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,8,1,bc075b991963319911ff3949a342a664d658de5b0f3dfc42a9f8677d7bcb7062
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,7,7,7ae9a03bf9849626750bf2e2d1c7fbf7680f14ea88f418c8968b787ba64df845
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,7,6,04dc7150deeea9da06b764ab4649e5c3cab97c145feaedac66aeb61ef308ac88
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,7,5,89fa07989becf96d664585bf2b844df0e950724f5f54220a8ecde10c02d9f3e9
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,7,4,e3acf885a0bdae2fb611bf89f39f3874540a36cb85a89c68b8de3d0f3151936b
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,7,3,88d876638de1db1335a10ad9c00e35edacefcc7a45d036c3812ab172e17f3323
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,7,2,89f619b0f5be528186c3ffc132d2f3f28f965f800f11a58141014075c234e737
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,7,1,f73bbe8cf50d4c868be584fe62d65105c8a2bbd27bc65635cf6c68a171bb2b57
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,6,8,fccd7cb4ac4583f94a72581790ed1190f0b45fe6cb8e8b1057746b2868c7617b
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,6,7,4299e8a72f455a5279a2061be0d952b504782796123be310678f8d60539f0691
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,6,6,0c5fa61618e40dbfc3b36428b4ad0dfb72c0b7d3e3004ca424ff8b1c4f8c4a9a
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,6,5,ffd732101664013411c32a56f3b8bdf6776098a89ca33d629a0ad9ede684359b
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,6,4,8c63617539b160090730162e2a44987d03ba8c27d5729f03cbcca1dcfc51bf32
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,6,3,6ffa508b19f37fbc550c756fed925ce46c85dde6c719d2190664a0039ac1ba54
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,6,2,c905aac4c7520a91eaec343d68ed727ac7c6c423f047b79096d5445d424326af
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,6,1,bab5135ebf8272fe6202e96ebf55cc9af45796a8650190c6139c478f8324ff87
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,5,10,6f454640a57d09a1cfcc575be2af68019802b0d7f2d0ba77234f4cf7e7bbe77a
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,5,9,97465ad838da8056f805e7685b626e0f436216ea07403f26a2a4686419f9aa53
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,5,8,8797b5f34e0f6cdcd9f26f4fd9ac2682fbf240ef7f8218375018ac48377627e0
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,5,7,b404e2636e1464db188cb54409511efcee2725c225fb4ba9d6fe9c4cf3207cf5
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,5,6,7accd872346bd835f8ac5594da5039d93538ea4e9e5f453f03b0688369e61aa8
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,5,5,382a2a964a13d0fd57b470d1c09d0fa228fb89796e551a40fd884fe1339102f1
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,5,4,835962d3c987b108f56734277b6be8d88b90835e76d919d5b391519eb51400fc
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,5,3,8848592e617e176e423f8ec3f6491357e01a81a3caabb46885500f31e5a6dfc2
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,5,2,3a8fe96ac21d247184f3418a1a76cf01660320b0927e664e7bbcb6800b6d6762
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,5,1,a6c15c5b548c896c098c4b57d999251f39f7e72450c6890bf632ef5fa3c9c832
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,4,10,28fbc1de662f307ac49c4206d7caef9db499cf5956395f365df2aa3e47c1981e
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,4,9,4ae15763844a57d33a22828a146ee27c453b23a26d3f1f1549b49f33ab06cfb4
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,4,8,c32129dddb0a0fd0255c120c707d0bc6bb5ac27844cb3409f4f3a3e784c7899d
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,4,7,82be6fb57d2e6bdef1734f6340a252960df036641f5a1d0344631f01bd2e78d8
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,4,6,a1504a7cd131d678d4786b20bdda9bfe127f3e48d331050f2abc9c87b8f89697
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,4,5,e70c61193b39dbf8942bd8425813de4c2624d1b5812b6f6bdadcbe7e65d70acd
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,4,4,13a562c2b446df407d41e6c27b0924bc6aa45a82d54821efa079339b7db2fa17
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,4,3,9300cd0e2feda869f10096ab18acfa0a2922bbeb36ab75d841f3907bd6a9b9ed
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,4,2,4ec3468f89065ffca017a54ddc29f0221ae65d3e714b35f9be2f5e4e36948d26
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,4,1,fa8d34932d1d11ec374ec304e210dfec2dbe9adc52a1613d0b51cfc0af5315e0
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,3,10,744751dc5a7869c0d31e74c55d7be75851ae7eccb54f3d5606c98c0d87fd005e
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,3,9,f2ed04e33401911e0b427dbe6d17104015ee0d3cb14252311169c3eeb1819cf0
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,3,8,ae63b9f88713f7568d5d5fef4b3573d57c32acf634d123022282ef16bd9a3306
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,3,7,d746fc169db4e6f0eab69528b5ef064a615a0021a2c66deae5c5e60284593666
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,3,6,0c28d0bd5c0dfa1db5d56ca31e257392802d5537c8bc31346d158f8377d83fd5
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,3,5,8be0668b3850482348877851bbba4828f075ce2663c7b63fc90fce55ba7b0d10
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,3,4,2a4502b1e66997dee05b77e84d92d35acdad4f6ae2016dca2ca0d3c208c4ea0e
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,3,3,ffdbd760473a455b25b0c05ec90a0a81e858daf707113f560bed38fbcdcda52a
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,3,2,783afbe28d3c558345e7def4ee7b05e56e8ce1e5f53321d01bc0da92e744b84a
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,3,1,2c7c6faeb28a9974d282151e3ce22815fc3691fef207d63ebdd1ba40abe907bf
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,2,20,7ac906d14c1825025b1603061e436231d38893e319228188b305da97329da528
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,2,10,d4c442a4267c3e4d969302fc9be08c426d686320e6edb47a7db66c3ea23078db
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,2,9,b8a2a395031f42054d59a6b83bf3459478f621d9eadfb3dfab7c00908fecf4ab
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,2,8,a7616f0e5a07283a21f84278eb58d09fd97c116d9ac977d25096169c41c930a0
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,2,7,90582c8c5a46148d13ae441d81ddce6ebf1416811cb4d5fa30231b2d2a6bdd4b
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,2,6,6c79a884d2299d54226f635f6beb9cfce1b9829c8d7eeb740447f903aee27ab2
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,2,5,5f48aa7e18b46090fe6819bd94ceee89e007793b1065b0e216e7071861e2c207
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,2,4,8ff1aca6b89b84acb4a6ca25ce2ab7e189df2e7dacc16ecda79bc4843807e39b
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,2,3,9d8975012670976405ae6e6ac8502df61b39e07ec82369c1db26c410b2d28619
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,2,2,12eeb62b684ff37f870d465c1c91bbf9647b699cec9ca9da6b2cb79d25f4a210
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,2,1,3c1b7471d0be6bf677e0aeab8de981e593c66cd8c413596ce2e3866b5900dd48
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,1,50,2dda1a278eb96fdc6f460f7a52fbe8d315b9334a4afd09b1da2f5ec8d46b6a4b
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,1,40,c14b331449d7037b920570432791db6596576455095a263c7e1764af1539c126
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,1,30,a7c7a5d1366378d9ba0f7e8bf0485478d3d11bba1628666143eda954446cdd89
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,1,20,2d178025bc43856985d9dc6979098f890d5feb80d0a93f4668f9cd84de248887
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,1,10,4154df01330ecd8024df055de523f1275f4337663e30fdf9da1f01a5e4bfa63a
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,1,9,1a8fa47fafc9bd1528015d6ed3b356252830f84dcd2bd0fafa6f325a91c93d44
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,1,8,174e2586f92da24535e73445977498ae0505e866f6b8a960e93efdc8a4f63c81
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,1,7,b77314676212289e1ec8905f7fbdd5df586a14e9b5fea7d8278d9779ff0f2010
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,1,6,2e7364b519dde698042a9820a3fa9cbee6fbab20b7a8095c11ef2b632670e10a
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,1,5,56658f9bf9e66285d0baed178f8dd64bee6d57511b89ed7f62140e2c9e43cca5
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,1,4,a990a4e47202664e0e8c08c6a603601b4c4ba589b4ead56d6901c1dfac0ac6b5
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,1,3,d4fd14bc51beffe81bea233a6ff6a1837ff30e9edf74f7d7de50c87d06042dce
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,1,2,15b8bed1f73aecfc2bba591964e2449fd025ffb494bb1db1bf7508a39e777106
jZzDUgrPpc4FrPGrfaKxtVrzv2tuXLLF,1,1,c95ced6449206cffc650c9d0e27a075850b5c9c7ca8c62028347b01e0dbdadbb

`;

if (import.meta.main) {
  // ===================================================================================================================================================================
  // Single Fund Csv
  // ===================================================================================================================================================================

  const single_fund_csv = parse(single_fund, {
    columns: ["id", "size", "hash"],
    skipFirstRow: true,
  });
  const single_fund_fees = Array<
    { id: string; size: number; bytes: number; fees: number; hash: string }
  >();
  for (const row of single_fund_csv) {
    const id = row.id;
    const size = parseInt(row.size);
    const hash = row.hash;
    const tx = await queryTx(hash);
    const bytes = tx.size;
    const fees = parseInt(tx.fees);
    const record = { id, size, bytes, fees, hash };
    console.log(record);
    single_fund_fees.push(record);
    await waitSeconds(1);
  }
  const single_fund_fees_csv = stringify(single_fund_fees, {
    columns: [
      "id",
      "size",
      "bytes",
      "fees",
      "hash",
    ],
  });

  // ===================================================================================================================================================================
  // Single Run Csv
  // ===================================================================================================================================================================
  const single_run_csv = parse(single_run, {
    columns: ["id", "size", "hash"],
    skipFirstRow: true,
  });
  const single_run_fees = Array<
    { id: string; size: number; bytes: number; fees: number; hash: string }
  >();
  for (const row of single_run_csv) {
    const id = row.id;
    const size = parseInt(row.size);
    const hash = row.hash;
    const tx = await queryTx(hash);
    const bytes = tx.size;
    const fees = parseInt(tx.fees);
    const record = { id, size, bytes, fees, hash };
    console.log(record);
    single_run_fees.push(record);
    await waitSeconds(1);
  }
  const single_run_fees_csv = stringify(single_run_fees, {
    columns: [
      "id",
      "size",
      "bytes",
      "fees",
      "hash",
    ],
  });

  // ===================================================================================================================================================================
  // Multi Fund Csv
  // ===================================================================================================================================================================
  const multi_fund_csv = parse(multi_fund, {
    columns: ["id", "nChunks", "chunkSize", "hash"],
    skipFirstRow: true,
  });
  const multi_fund_fees = Array<
    {
      id: string;
      nChunks: number;
      chunkSize: number;
      bytes: number;
      fees: number;
      hash: string;
    }
  >();
  for (const row of multi_fund_csv) {
    const id = row.id;
    const nChunks = parseInt(row.nChunks);
    const chunkSize = parseInt(row.chunkSize);
    const hash = row.hash;
    const tx = await queryTx(hash);
    const bytes = tx.size;
    const fees = parseInt(tx.fees);
    const record = { id, nChunks, chunkSize, bytes, fees, hash };
    console.log(record);
    multi_fund_fees.push(record);
    await waitSeconds(1);
  }
  const multi_fund_fees_csv = stringify(multi_fund_fees, {
    columns: [
      "id",
      "nChunks",
      "chunkSize",
      "bytes",
      "fees",
      "hash",
    ],
  });

  // ===================================================================================================================================================================
  // Multi Run Csv
  // ===================================================================================================================================================================
  const multi_run_csv = parse(multi_run, {
    columns: ["id", "nChunks", "chunkSize", "hash"],
    skipFirstRow: true,
  });
  const multi_run_fees = Array<
    {
      id: string;
      nChunks: number;
      chunkSize: number;
      bytes: number;
      fees: number;
      hash: string;
    }
  >();
  for (const row of multi_run_csv) {
    const id = row.id;
    const nChunks = parseInt(row.nChunks);
    const chunkSize = parseInt(row.chunkSize);
    const hash = row.hash;
    const tx = await queryTx(hash);
    const bytes = tx.size;
    const fees = parseInt(tx.fees);
    const record = { id, nChunks, chunkSize, bytes, fees, hash };
    console.log(record);
    multi_run_fees.push(record);
    await waitSeconds(1);
  }
  const multi_run_fees_csv = stringify(multi_run_fees, {
    columns: [
      "id",
      "nChunks",
      "chunkSize",
      "bytes",
      "fees",
      "hash",
    ],
  });

  console.log(single_fund_fees_csv);
  console.log(single_run_fees_csv);
  console.log(multi_fund_fees_csv);
  console.log(multi_run_fees_csv);
}
