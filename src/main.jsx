import "chartist/dist/index.css";
import "./index.css";

import {
  ApolloClient,
  ApolloLink,
  ApolloProvider,
  HttpLink,
  InMemoryCache,
  from,
  gql,
} from "@apollo/client";

import App from "./App.jsx";
import React from "react";
import ReactDOM from "react-dom/client";

const cache = new InMemoryCache();
const httpLink = new HttpLink({ uri: import.meta.env.VITE_GRAPHQL_URI });

const makeAuthMiddleware = (token) =>
  new ApolloLink((operation, forward) => {
    operation.setContext(({ headers = {} }) => ({
      headers: {
        ...headers,
        authorization: `Bearer ${token}`,
      },
    }));
    return forward(operation);
  });

const authRefreshMiddleware = makeAuthMiddleware(import.meta.env.VITE_REFRESH_TOKEN);
const refreshClient = new ApolloClient({ link: from([authRefreshMiddleware, httpLink]), cache });

const SIGN_IN_MUTATION = gql`
  mutation {
    signIn {
      token {
        token
      }
    }
  }
`;

const { data: signinData } = await refreshClient.mutate({ mutation: SIGN_IN_MUTATION });

const authMiddleware = makeAuthMiddleware(signinData.signIn.token.token);
const client = new ApolloClient({ link: from([authMiddleware, httpLink]), cache });

ReactDOM.createRoot(document.getElementById("root")).render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>
);
