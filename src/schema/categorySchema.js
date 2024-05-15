import { gql } from "apollo-server";

export const categoryTypeDefs = gql`
  scalar DateTime
    @specifiedBy(url: "https://scalars.graphql.org/andimarek/date-time")

  type Category {
    id: ID!
    name: String!
    slug: String
    deletedAt: DateTime
    createdAt: DateTime!
    updatedAt: DateTime!
    posts: [Post!]!
  }

  input CategoryFilter {
    name_regex: String
    slug_regex: String
    id: ID
  }

  enum CategoryOrder {
    createdAt_DESC
    createdAt_ASC
  }

  type Query {
    allCategories(
      filter: CategoryFilter
      first: Int
      skip: Int
      orderBy: CategoryOrder
    ): [Category!]!

    category(id: ID!): Category
  }
  type CommonResponseCategory {
    success: Boolean!
    message: String
    category: Category!
  }
  input NewCategoryInput {
    name: String!
    slug: String
  }
  input UpdateCategoryInput {
    name: String!
    slug: String
  }
  type Mutation {
    createCategory(input: NewCategoryInput!): CommonResponseCategory
    updateCategory(id: ID!, input: UpdateCategoryInput!): CommonResponse
    deleteCategory(id: ID!): CommonResponse
  }
`;
