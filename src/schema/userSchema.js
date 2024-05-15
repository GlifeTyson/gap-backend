import { gql } from "apollo-server";

export const userTypeDefs = gql`
  type User {
    id: ID!
    email: String!
    username: String!
    fullName: String
    password: String
    avatarUrl: String
    lastLoggedInAt: DateTime
    deletedAt: DateTime
    createdAt: DateTime!
    updatedAt: DateTime!
    posts: [Post!]!
    roleId: ID!
    role: Role!
  }
  enum RoleType {
    SuperAdmin
    MerchantAdmin
  }
  enum RoleType {
    SuperAdmin
    User
  }
  type LoginResponse {
    success: Boolean!
    message: String
    token: String
    user: User
  }
  type RegisterResponse {
    success: Boolean!
    message: String
    user: User
  }
  type Error {
    field: String
    path: String
    message: String
  }
  type CommonResponse {
    success: Boolean!
    message: String
    errors: [Error!]
  }
  input NewUserInput {
    email: String!
    username: String!
    fullName: String
    password: String!
    avatarUrl: String
    roleId: ID!
  }
  input UpdateUserInput {
    email: String
    username: String
    fullName: String
    password: String
    avatarUrl: String
    roleId: ID
  }
  enum UserOrder {
    createdAt_ASC
    createdAt_DESC
  }
  input UserFilter {
    id: ID
    username_regex: String
    email_regex: String
    fullName_regex: String
  }
  type Query {
    allUsers(
      filter: UserFilter
      first: Int
      skip: Int
      orderBy: UserOrder
      include: String
    ): [User!]!
    getUser(id: ID!): User
  }
  type Mutation {
    createUser(input: NewUserInput!): RegisterResponse
    updateUser(id: String!, input: UpdateUserInput!): RegisterResponse
    deleteUser(id: ID!): CommonResponse
    login(username: String!, password: String!): LoginResponse!
  }
`;
