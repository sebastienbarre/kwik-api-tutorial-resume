import "./App.css";

import { gql, useQuery } from "@apollo/client";

import React from "react";

const TEST_QUERY = gql`
  query {
    me {
      email
    }
  }
`;

export default function App() {
  const { loading, data } = useQuery(TEST_QUERY);
  return <h1>{loading ? "loading..." : data?.me?.email}</h1>;
}
