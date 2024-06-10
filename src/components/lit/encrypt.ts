import { litNodeClient, accessControlConditions, chain, sessionSigs } from "./index";
import * as LitJsSdk from "@lit-protocol/lit-node-client-nodejs";
import {
  type SessionSigsOrAuthSig,
  type EncryptStringRequest,
} from "@lit-protocol/types";

interface CustomEncryptStringRequest extends EncryptStringRequest {
  sessionSigs: SessionSigsOrAuthSig;
}

export const encrypt = async (
  message: string,
): Promise<{ ciphertext: string; dataToEncryptHash: string } | undefined> => {
  try {
    await litNodeClient.connect();
    const sigs = await sessionSigs();
    const { ciphertext, dataToEncryptHash } = await LitJsSdk.encryptString(
      {
        accessControlConditions,
        sessionSigs: sigs,
        chain,
        dataToEncrypt: message,
      } as CustomEncryptStringRequest,
      litNodeClient,
    );
    console.log("cipher text:", ciphertext, "hash:", dataToEncryptHash);
    return { ciphertext, dataToEncryptHash };
  } catch (error) {
    console.error(error);
  }
};
