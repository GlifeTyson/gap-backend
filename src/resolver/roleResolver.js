import { prisma } from "../connectDb/db.js";
import buildMongoFilters from "../utils/buildMongoFilters.js";
import buildMongoOrders from "../utils/buildMongoOrders.js";

export const roleResolvers = {
  Query: {
    allRoles: async (parent, args, context) => {
      try {
        const { authorizedUser } = context;

        if (!authorizedUser) {
          throw new Error("Unauthorized");
        }

        const { filter = {}, skip, first, orderBy } = args;
        const limit = first || 10;
        const offset = skip || 0;

        const filters = buildMongoFilters(filter);
        const ordersBy = buildMongoOrders(orderBy);

        const roles = await prisma.role.findMany({
          skip: offset,
          take: limit,
          where: filters,
          orderBy: ordersBy,
          include: {
            users: true,
          },
        });

        return roles;
      } catch (error) {
        throw new Error(error);
      }
    },
    getRole: async (_, { id }, context) => {},
  },
  Mutation: {
    createRole: async (parent, args, context) => {
      try {
        const { authorizedUser } = context;

        if (!authorizedUser) {
          throw new Error("Unauthorized");
        }

        if (!args.name) {
          throw new Error("Name is required");
        }

        const role = await prisma.role.create({
          data: {
            name: args.name,
            role: args.role,
          },
        });

        return role;
      } catch (error) {
        throw new Error(error);
      }
    },
    updateRole: async (parent, args) => {},
    deleteRole: async (parent, args) => {},
  },
};
