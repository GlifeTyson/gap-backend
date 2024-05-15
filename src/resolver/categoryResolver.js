import slugify from "slugify";
import { prisma } from "../connectDb/db.js";
import buildMongoFilters from "../utils/buildMongoFilters.js";
import buildMongoOrders from "../utils/buildMongoOrders.js";

export const categoryResolvers = {
  Query: {
    allCategories: async (parent, args, context) => {
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

        // include (Post(id,name,content))

        const obj = await prisma.category.findMany({
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

    category: (parent, args) => {
      return prisma.post.findUnique({
        where: { id: Number(args.id) },
      });
    },
  },
  Mutation: {
    createCategory: async (parent, { input: args }, context) => {
      try {
        const { authorizedUser } = context;
        if (!authorizedUser) {
          throw new Error("Unauthorized");
        }
        if (!args.name) {
          throw new Error("Name is required");
        }
        args.slug = args.slug
          ? slugify(args.slug.toLowerCase())
          : slugify(args.name.toLowerCase());

        const { slug } = await checkSlugExist(args.slug, prisma);

        const categoryCreate = await prisma.category.create({
          data: {
            name: args.name,
            slug: slug,
          },
        });
        const category = await prisma.category.findUnique({
          where: {
            id: categoryCreate.id,
          },
          include: {
            posts: true,
          },
        });

        return {
          category: category,
          message: "Category created successfully",
          success: true,
        };
      } catch (error) {
        throw new Error(error.message);
      }
    },

    updateCategory: async (parent, { id, input: args }, context) => {
      try {
        const { authorizedUser } = context;
        if (!authorizedUser) {
          throw new Error("Unauthorized");
        }

        const categoryFound = await prisma.category.findUnique({
          where: {
            id: String(id),
          },
        });

        if (!categoryFound) {
          throw new Error("Category not found");
        }

        if (!args.name) {
          throw new Error("Name is required");
        }

        if (args.slug) {
          const { slug } = await checkSlugExist(args.slug, prisma);
          args.slug = slug;
        }

        const categoryUpdate = await prisma.category.update({
          where: {
            id: String(id),
          },
          data: args,
        });

        const category = await prisma.category.findUnique({
          where: {
            id: categoryUpdate.id,
          },
          include: {
            posts: true,
          },
        });

        return {
          category: category,
          message: "Category updated successfully",
          success: true,
        };
      } catch (error) {
        throw new Error(error.message);
      }
    },

    deleteCategory: async (_, { id }) => {
      try {
        const category = await prisma.category.findUnique({
          where: { id: id },
        });

        if (!category) {
          throw new Error(`Category not found`);
        }

        await prisma.category.update({
          where: { id: id },
          data: {
            deletedAt: new Date(),
          },
        });

        return {
          success: true,
          message: "Category deleted successfully",
        };
      } catch (error) {
        throw new Error(error);
      }
    },
  },
};

export const checkSlugExist = async (slug, prisma) => {
  let existingSlug = await prisma.category.findUnique({
    where: { slug: slug },
  });

  if (!existingSlug) {
    return { slug: slugify(slug), isExist: false };
  }

  for (let slugIndex = 1; ; slugIndex++) {
    existingSlug = await prisma.category.findUnique({
      where: { slug: `${slug}-${slugIndex}` },
    });
    if (!existingSlug) {
      slug = `${slug}-${slugIndex}`;
      break;
    }
  }

  return { slug: slug, isExist: true };
};
