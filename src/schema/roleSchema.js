import { gql } from "apollo-server";

export const roleTypeDefs = gql`
  type Role {
    id: ID!
    name: String!
    role: RoleType!
    createdAt: DateTime!
    updatedAt: DateTime!
    deletedAt: DateTime
    users: [User!]!
  }
  input RoleFilter {
    id: ID
    name: String
    role: RoleType
    name_regex: String
  }
  enum RoleType {
    SuperAdmin
    User
  }
  enum RoleOrder {
    createdAt_DESC
    createdAt_ASC
  }
  type Query {
    allRoles(
      filter: RoleFilter
      first: Int
      skip: Int
      orderBy: RoleOrder
    ): [Role!]!
    getRole(id: ID!): Role
  }
  type Mutation {
    createRole(name: String!, role: RoleType!): Role
    updateRole(id: ID!, name: String!): Role
    deleteRole(id: ID!): Role
  }
`;
