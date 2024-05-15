import { gql } from "apollo-server";

export const postTypeDefs = gql`
  scalar DateTime
    @specifiedBy(url: "https://scalars.graphql.org/andimarek/date-time")

  type Post {
    id: ID!
    title: String!
    content: String!
    published: Boolean!
    deletedAt: DateTime
    createdAt: DateTime!
    updatedAt: DateTime!
    slug: String
    authorId: ID!
    author: User!
    categoryId: ID!
    category: Category!
  }

  input PostFilter {
    title_regex: String
    content_regex: String
    slug_regex: String
    authorId: ID
    categoryId: ID
  }

  enum PostOrder {
    createdAt_DESC
    createdAt_ASC
  }
  type CommonResponse {
    message: String
    success: Boolean!
  }
  type Query {
    allPosts(
      filter: PostFilter
      first: Int
      skip: Int
      orderBy: PostOrder
      include: String
    ): [Post!]!
    post(id: ID!): Post
    postWithAuthor(id: ID!): Post
    myPosts: [Post!]!
  }
  input CreatePostInput {
    content: String!
    title: String!
    categoryId: ID!
    slug: String
  }
  type Mutation {
    createPost(input: CreatePostInput!): Post!
    pulishPost(id: ID!): CommonResponse!
    deletePost(id: ID!): CommonResponse!
  }
`;
