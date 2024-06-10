import { ApolloClient, InMemoryCache } from "@apollo/client";

const uri = process.env.HASURA_URL ?? "";
const secret = process.env.HASURA_SECRET ?? "";

export const apolloClient = new ApolloClient({
  uri,
  cache: new InMemoryCache(),
  headers: {
    "x-hasura-admin-secret": secret,
  },
});
