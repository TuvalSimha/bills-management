import { makeExecutableSchema } from '@graphql-tools/schema'
import type { Bill, Item, Link, User } from '@prisma/client'
import type { GraphQLContext } from './context'
import { compare, hash } from 'bcryptjs'
import { sign } from 'jsonwebtoken'
import { APP_SECRET } from './auth'
import { typeDefinitions } from './type-definitions'


const resolvers = {
  Query: {
    me(parent: unknown, args: {}, context: GraphQLContext) {
      if (context.currentUser === null) {
        throw new Error('Unauthenticated!')
      }

      return context.currentUser
    }
  },
  User: {
    id: (parent: User) => parent.id,
    name: (parent: User) => parent.name,
    email: (parent: User) => parent.email,
    links: (parent: User, args: {}, context: GraphQLContext) =>
      context.prisma.user.findUnique({ where: { id: parent.id } }).links()


  },
  Bill: {
    id: (parent: Bill) => parent.id,
    createdAt: (parent: Bill) => parent.createdAt,
    description: (parent: Bill) => parent.description,
    amount: (parent: Bill) => parent.amount,
    paidBy(parent: Bill, args: {}, context: GraphQLContext) {
      if (!parent.paidById) {
        return null
      }

      return context.prisma.bill.findUnique({ where: { id: parent.id } }).paidBy()
    },
    items(parent: Bill, args: {}, context: GraphQLContext) {
      return context.prisma.bill.findUnique({ where: { id: parent.id } }).items()
    }
  },
  Item: {
    id: (parent: Item) => parent.id,
    createdAt: (parent: Item) => parent.createdAt,
    description: (parent: Item) => parent.description,
    amount: (parent: Item) => parent.amount,
    bill(parent: Item, args: {}, context: GraphQLContext) {
      return context.prisma.item.findUnique({ where: { id: parent.id } }).bill()
    }
  },
  Link: {
    id: (parent: Link) => parent.id,
    description: (parent: Link) => parent.description,
    url: (parent: Link) => parent.url,
    postedBy(parent: Link, args: {}, context: GraphQLContext) {
      if (!parent.postedById) {
        return null
      }

      return context.prisma.link.findUnique({ where: { id: parent.id } }).postedBy()
    }
  },
  Mutation: {
    async signup(
      parent: unknown,
      args: { email: string; password: string; name: string },
      context: GraphQLContext
    ) {
      const password = await hash(args.password, 10)

      const user = await context.prisma.user.create({
        data: { ...args, password }
      })

      const token = sign({ userId: user.id }, APP_SECRET)

      return { token, user }
    },
    async login(
      parent: unknown,
      args: { email: string; password: string },
      context: GraphQLContext
    ) {
      // 1
      const user = await context.prisma.user.findUnique({
        where: { email: args.email }
      })
      if (!user) {
        throw new Error('No such user found')
      }

      // 2
      const valid = await compare(args.password, user.password)
      if (!valid) {
        throw new Error('Invalid password')
      }

      const token = sign({ userId: user.id }, APP_SECRET)

      // 3
      return { token, user }
    },
    async createBill(
      parent: unknown,
      args: { description: string; amount: number },
      context: GraphQLContext
    ) {
      if (context.currentUser === null) {
        throw new Error('Unauthenticated!')
      }

      const newBill = await context.prisma.bill.create({
        data: {
          description: args.description,
          amount: args.amount,
          paidBy: { connect: { id: context.currentUser.id } }
        }
      })

      return newBill
    },

    async payBill(
      parent: unknown,
      args: { billId: number },
      context: GraphQLContext
    ) {
      if (context.currentUser === null) {
        throw new Error('Unauthenticated!')
      }

      const bill = await context.prisma.bill.findUnique({
        where: { id: args.billId }
      })

      if (!bill) {
        throw new Error('No such bill found')
      }

      if (bill.paidById !== null) {
        throw new Error('Bill is already paid')
      }

      const updatedBill = await context.prisma.bill.update({
        where: { id: args.billId },
        data: {
          paidById: context.currentUser.id
        }
      })

      return updatedBill
    },

    async deleteBill(
      parent: unknown,
      args: { billId: number },
      context: GraphQLContext
    ) {
      if (context.currentUser === null) {
        throw new Error('Unauthenticated!')
      }

      const bill = await context.prisma.bill.findUnique({
        where: { id: args.billId }
      })

      if (!bill) {
        throw new Error('No such bill found')
      }

      if (bill.paidById !== context.currentUser.id) {
        throw new Error('Not authorized to delete this bill')
      }

      const deletedBill = await context.prisma.bill.delete({
        where: { id: args.billId }
      })

      return deletedBill
    },

    async updateBill(
      parent: unknown,
      args: { billId: number; description: string; amount: number },
      context: GraphQLContext
    ) {
      if (context.currentUser === null) {
        throw new Error('Unauthenticated!')
      }

      const bill = await context.prisma.bill.findUnique({
        where: { id: args.billId }
      })

      if (!bill) {
        throw new Error('No such bill found')
      }

      if (bill.paidById !== context.currentUser.id) {
        throw new Error('Not authorized to update this bill')
      }

      const updatedBill = await context.prisma.bill.update({
        where: { id: args.billId },
        data: {
          description: args.description,
          amount: args.amount
        }
      })

      return updatedBill
    },

    async createItem(
      parent: unknown,
      args: { billId: number; description: string; amount: number },
      context: GraphQLContext
    ) {
      if (context.currentUser === null) {
        throw new Error('Unauthenticated!')
      }

      const bill = await context.prisma.bill.findUnique({
        where: { id: args.billId }
      })

      if (!bill) {
        throw new Error('No such bill found')
      }

      if (bill.paidById !== context.currentUser.id) {
        throw new Error('Not authorized to add items to this bill')
      }

      const newItem = await context.prisma.item.create({
        data: {
          description: args.description,
          amount: args.amount,
          bill: { connect: { id: args.billId } }
        }
      })

      return newItem
    },

    async deleteItem(
      parent: unknown,
      args: { itemId: number },
      context: GraphQLContext
    ) {
      if (context.currentUser === null) {
        throw new Error('Unauthenticated!')
      }

      const item = await context.prisma.item.findUnique({
        where: { id: args.itemId }
      })

      if (!item) {
        throw new Error('No such item found')
      }

      const bill = await context.prisma.bill.findUnique({
        where: { id: item.billId }
      })

      if (!bill) {
        throw new Error('No such bill found')
      }

      if (bill.paidById !== context.currentUser.id) {
        throw new Error('Not authorized to delete items from this bill')
      }

      const deletedItem = await context.prisma.item.delete({
        where: { id: args.itemId }
      })

      return deletedItem
    },

    async updateItem(
      parent: unknown,
      args: { itemId: number; description: string; amount: number },
      context: GraphQLContext
    ) {
      if (context.currentUser === null) {
        throw new Error('Unauthenticated!')
      }

      const item = await context.prisma.item.findUnique({
        where: { id: args.itemId }
      })

      if (!item) {
        throw new Error('No such item found')
      }

      const bill = await context.prisma.bill.findUnique({
        where: { id: item.billId }
      })

      if (!bill) {
        throw new Error('No such bill found')
      }

      if (bill.paidById !== context.currentUser.id) {
        throw new Error('Not authorized to update items from this bill')
      }

      const updatedItem = await context.prisma.item.update({
        where: { id: args.itemId },
        data: {
          description: args.description,
          amount: args.amount
        }
      })

      return updatedItem
    }


  }
}

export const schema = makeExecutableSchema({
  resolvers: [resolvers],
  typeDefs: [typeDefinitions]
})