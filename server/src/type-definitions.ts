export const typeDefinitions = /* GraphQL */ `
scalar DateTime

type Query {
  me: User!
}
 
type Mutation {
  signup(email: String!, password: String!, name: String!): AuthPayload
  login(email: String!, password: String!): AuthPayload
  createBill(description: String!, amount: Float!): Bill!
  payBill(billId: ID!): Bill!
  deleteBill(billId: ID!): Bill!
  updateBill(billId: ID!, description: String!, amount: Float!): Bill!
  createItem(billId: ID!, description: String!, amount: Float!): Item!
  deleteItem(itemId: ID!): Item!
  updateItem(itemId: ID!, description: String!, amount: Float!): Item!
}
 
type Link {
  id: ID!
  description: String!
  url: String!
  postedBy: User
}
 
type AuthPayload {
  token: String
  user: User
}
 
type User {
  id: ID!
  name: String!
  email: String!
  links: [Link!]!
  bills: [Bill!]!
}

type Bill {
  id: ID!
  createdAt: DateTime!
  description: String!
  amount: Float!
  paidBy: User
  items: [Item!]!
}

type Item {
  id: ID!
  createdAt: DateTime!
  description: String!
  amount: Float!
  bill: Bill
}
`