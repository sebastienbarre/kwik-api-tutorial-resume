import "./App.css";

import { endOfMonth, format, subMonths } from "date-fns";

import { ME_QUERY } from "./meQuery";
import React from "react";
import { useQuery } from "@apollo/client";

export default function App() {
  const variables = {
    endOfLastMonth: format(endOfMonth(subMonths(new Date(), 1)), "yyyy-MM-dd"),
  };
  const { loading, error, data } = useQuery(ME_QUERY, { variables });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error : {error.message}</p>;
  return <h1>{data?.me?.email}</h1>;
}
