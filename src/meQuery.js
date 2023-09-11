import { EMPLOYEE_FRAGMENT } from "./employeeFragment";
import { gql } from "@apollo/client";

export const ME_QUERY = gql`
  query me($endOfLastMonth: Date!) {
    me {
      ...employeeFields
    }
  }
  ${EMPLOYEE_FRAGMENT}
`;
