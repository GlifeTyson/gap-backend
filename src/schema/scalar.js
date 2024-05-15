import { gql } from "apollo-server";

export const scalarTypeDefs = gql`
  type CommonResponse {
    success: Boolean!
    message: String
    errors: [Error!]
  }
  type Error {
    field: String
    path: String
    message: String
  }
`;
