import { apolloClient } from "./client";
import { useQuery, gql } from '@apollo/client';
import { type ScoreInput } from "../../types";

const questions: Record<string, string> = {
  participant: "How do you want to participate in the Atlas community?",
  excitement: "On a scale of 1-10, how excited are you about Atlas?",
  xUsername: "Connect your X account. - Twitter Username",
  email: "What is your email address?",
  address: "What is your wallet address? - Wallet Address",
  discordHandle: "Connect your Discord account. - Discord Display Name",
  discordId: "Connect your Discord account. - Discord User ID",
};

export const saveCustomers = async (
  input: ScoreInput,
): Promise<
  | undefined
  | { error: string }
> => {
  try {

    const { rows, startRow } = input;
    const saved = [];
    console.log("Writing customers to database...");
    // first start at startRow index while iterating through entry
    for (let i = startRow; i < rows.length; i++) {
      const userAnswers = {} as Record<string, string | string[] | undefined>;
      // iterate through questions and find the relevant answer object based on if the name matches the key
      const answers = rows[i]?.answers;
      console.log("Answers: ", answers);
      for (const key in questions) {
        // locate the correct answer as a string
        const question = questions[key];
        const answer = answers?.find((answer) => answer.name === question);
        userAnswers[key] = answer?.value;
      }

      // save the customer to the database and return the saved customer
      const saveCustomer = await apolloClient.mutate<{
        saveCustomer: Record<string, string | number | string[] | boolean>
      }>({
        mutation: gql`
          mutation SaveCustomer{
            insert_customers(
              participant: ${JSON.stringify(JSON.stringify(userAnswers.participant).replace(/"([^"]+)":/g, '$1:'))},
              excitement: ${Number(userAnswers.excitement)},
              xUsername: "${userAnswers.xUsername}",
              email: "${userAnswers.email}",
              address: "${userAnswers.address}",
              discordHandle: "${userAnswers.discordHandle}",
              discordId: "${userAnswers.discordId}"
            ) {
              participant
              excitement
              xUsername
              email
              address
              discordHandle
              discordId
            }
          }
        `
      });
      saved.push(saveCustomer.data?.saveCustomer);
    }
 
    console.log("Saved customers: ", saved);
    return
  } catch (error) {
    console.error(error);
    return { error: "Internal Server Error" };
  }
};
