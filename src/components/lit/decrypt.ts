import { litNodeClient, accessControlConditions, sessionSigs } from "./index";
import { type SessionSigsOrAuthSig } from "@lit-protocol/types";

export const decrypt = async ({
  ciphertext,
  hash,
}: {
  ciphertext: string;
  hash: string;
}) => {
  try {
    const code = `(async () => {
    const resp = await Lit.Actions.decryptAndCombine({
      accessControlConditions,
      ciphertext,
      dataToEncryptHash,
      authSig: null,
      chain: 'ethereum',
    });
  
    Lit.Actions.setResponse({ response: resp });
  })();`;

    const res = await litNodeClient.executeJs({
      code,
      sessionSigs,
      jsParams: {
        accessControlConditions,
        ciphertext,
        dataToEncryptHash: hash,
      },
    });
    console.log("decrypted message:", res);
    return res;
  } catch (error) {
    console.error(error);
  }
};
