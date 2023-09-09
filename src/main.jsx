import "./index.css";

import { ApolloClient, ApolloLink, HttpLink, InMemoryCache, from, gql } from "@apollo/client";

import App from "./App.jsx";
import React from "react";
import ReactDOM from "react-dom/client";

const cache = new InMemoryCache();
const httpLink = new HttpLink({ uri: import.meta.env.VITE_GRAPHQL_URI });

const authRefreshMiddleware = new ApolloLink((operation, forward) => {
  operation.setContext(({ headers = {} }) => ({
    headers: {
      ...headers,
      authorization: `Bearer ${import.meta.env.VITE_REFRESH_TOKEN}`,
    },
  }));
  return forward(operation);
});

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

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* <App /> */}
    <h1>{signinData?.signIn?.token?.token?.substr(0, 10)}...</h1>
  </React.StrictMode>
);
