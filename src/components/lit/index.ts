import {
  LitActionResource,
  type LitResourceAbilityRequest,
  LitAbility,
  createSiweMessageWithRecaps,
  generateAuthSig,
} from "@lit-protocol/auth-helpers";
import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { ethers } from "ethers";
import { type AccessControlConditions } from "@lit-protocol/types";

declare global {
  interface Window {
    ethereum?: Record<string, unknown> | undefined;
  }
}

export const chain = "ethereum";

export const accessControlConditions: AccessControlConditions = [
  {
    contractAddress: "",
    standardContractType: "",
    chain,
    method: "",
    parameters: [":userAddress"],
    returnValueTest: {
      comparator: "=",
      value: "0x514E3B94F0287cAf77009039B72C321Ef5F016E6",
    },
  },
];

export const litNodeClient = new LitNodeClient({
  litNetwork: "habanero",
});

export const sessionSigs = async () => {
  if (!window.ethereum) {
    throw new Error("No ethereum provider found");
  }
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  const ethersSigner = provider.getSigner();

  await litNodeClient.connect();
  await litNodeClient.getSessionSigs({
    chain: "ethereum",
    expiration: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // 24 hours
    resourceAbilityRequests: [
      {
        resource: new LitActionResource("*"),
        ability: LitAbility.LitActionExecution,
      },
    ],
    authNeededCallback: async ({
      resourceAbilityRequests = [],
      expiration = "",
      uri = "",
    }: {
      resourceAbilityRequests?: LitResourceAbilityRequest[];
      expiration?: string;
      uri?: string;
    }) => {
      const toSign = await createSiweMessageWithRecaps({
        uri,
        expiration,
        resources: resourceAbilityRequests,
        walletAddress: await ethersSigner.getAddress(),
        nonce: await litNodeClient.getLatestBlockhash(),
        litNodeClient,
      });

      return await generateAuthSig({
        signer: ethersSigner,
        toSign,
      });
    },
  });
};
