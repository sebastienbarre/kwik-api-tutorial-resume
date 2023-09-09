import "./index.css";

import { ApolloClient, InMemoryCache, gql } from "@apollo/client";

import App from "./App.jsx";
import React from "react";
import ReactDOM from "react-dom/client";

const cache = new InMemoryCache();
const client = new ApolloClient({ uri: import.meta.env.VITE_GRAPHQL_URI, cache });

const PING_QUERY = gql`
  query {
    ping
  }
`;

const { data } = await client.query({ query: PING_QUERY });

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* <App /> */}
    <h1>{data.ping}</h1>
  </React.StrictMode>
);
