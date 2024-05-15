import { prisma } from "../connectDb/db.js";
import { validateUserInput } from "../validator/userValidator.js";
import { comparePassword, createTokens, hashPassword } from "../utils/auth.js";
import buildMongoFilters from "../utils/buildMongoFilters.js";
import buildMongoOrders from "../utils/buildMongoOrders.js";

export const userResolvers = {
  Query: {
    allUsers: async (parent, args, context) => {
      try {
        const { filter = {}, skip, first, orderBy, include } = args;
        const includeItem = {};

        if (include) {
          include.split(",").forEach((item) => {
            includeItem[item] = true;
          });
        }

        const { authorizedUser } = context;
        if (!authorizedUser) {
          throw new Error("Unauthorized");
        }
        const limit = first || 10;
        const offset = skip || 0;

        const filters = buildMongoFilters(filter);
        const ordersBy = buildMongoOrders(orderBy);

        // console.log("filters", filters);
        const obj = await prisma.user.findMany({
          skip: offset,
          take: limit,
          where: filters,
          orderBy: ordersBy,
          include: include ? includeItem : {},
        });
        return obj;
      } catch (error) {
        throw new Error(error);
      }
    },
    getUser: (parent, args) => {},
  },
  Mutation: {
    createUser: async (parent, { input: args }, context) => {
      // Register
      // Step 1: validate input
      const validationErrors = validateUserInput(args);
      if (validationErrors) {
        throw new Error(
          Object.values(validationErrors)
            .map((error) => error.join(", "))
            .join("; ")
        );
      }
      // Step 2:  check exist user use or (email,username)
      const user = await prisma.user.findUnique({
        where: {
          username: String(args.username),
          deletedAt: { isSet: false },
        },
      });
      if (!user) {
        // hash password to save in database
        if ("password" in args) {
          args.password = hashPassword(args.password);
        }
        const createUser = await prisma.user.create({
          data: {
            username: args.username,
            email: args.email,
            fullName: args.fullName,
            password: args.password,
            avatarUrl: args.avatarUrl || "",
            roleId: args.roleId,
          },
        });
        const userCreated = await prisma.user.findUnique({
          where: {
            id: createUser.id,
          },
        });
        return {
          success: true,
          user: userCreated,
          message: "User created successfully",
        };
      } else {
        throw new Error("Username already exists");
      }
    },
    login: async (parent, args, context) => {
      const { username, password } = args;
      const { SECRET1 } = context;
      if (username) {
        const user = await prisma.user.findFirst({
          where: {
            OR: [{ username: username }, { email: username }],
            deletedAt: { isSet: false },
          },
        });
        if (!user) {
          throw new Error("Username does not exist");
        } else {
          const valid = comparePassword(password, user.password);
          if (!valid) {
            return {
              success: false,
              message: "Wrong password",
            };
          } else {
            const token = await createTokens({ user: user, secret1: SECRET1 });

            return {
              user: user,
              token,
              success: true,
              message: "Login Success",
            };
          }
        }
      }
    },
    updateUser: async (parent, { id, input: args }, context) => {
      try {
        const { authorizedUser } = context;
        if (!authorizedUser) {
          throw new Error("Unauthorized");
        }
        const validationErrors = validateUserInput(args);
        if (validationErrors) {
          throw new Error(
            Object.values(validationErrors)
              .map((error) => error.join(", "))
              .join("; ")
          );
        }
        // check if id is exist
        const userFound = await prisma.user.findUnique({
          where: {
            id: String(id),
          },
        });
        if (!userFound) {
          throw new Error("User not found");
        }

        const user = await prisma.user.update({
          where: {
            id: String(id),
          },
          data: args,
        });

        return {
          success: true,
          user: user,
          message: "User Updated Successfully",
        };
      } catch (error) {
        throw new Error(error);
      }
    },
    deleteUser: async (_, { id }) => {
      try {
        const userFound = await prisma.user.findUnique({
          where: {
            id: String(id),
          },
        });

        if (!userFound) {
          throw new Error("User not found");
        }

        const user = await prisma.user.update({
          where: {
            id: String(id),
          },
          data: {
            deletedAt: new Date(),
          },
        });
        return {
          success: true,
          message: "User deleted successfully",
        };
      } catch (error) {}
    },
  },
};
