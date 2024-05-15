import slugify from "slugify";
import { prisma } from "../connectDb/db.js";
import buildMongoFilters from "../utils/buildMongoFilters.js";
import buildMongoOrders from "../utils/buildMongoOrders.js";

export const postResolvers = {
  Query: {
    allPosts: async (parent, args, context) => {
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

        const obj = await prisma.post.findMany({
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
    postWithAuthor: async (parent, args, context) => {
      try {
        const { authorizedUser } = context;
        if (!authorizedUser) {
          throw new Error("Unauthorized");
        } else {
          return await prisma.post.findUnique({
            where: { id: String(args.id) },
            include: {
              author: true,
            },
          });
        }
      } catch (error) {
        throw new Error(error);
      }
    },
    myPosts: async (parent, args, context) => {
      try {
        const { authorizedUser } = context;
        if (!authorizedUser) {
          throw new Error("Unauthorized");
        } else {
          return await prisma.post.findMany({
            where: { authorId: String(authorizedUser.id) },
            include: {
              author: true,
            },
          });
        }
      } catch (error) {
        throw new Error(error);
      }
    },
    post: (parent, args) => {
      return prisma.post.findUnique({
        where: { id: Number(args.id) },
      });
    },
  },
  Mutation: {
    createPost: async (parent, { input: args }, context) => {
      try {
        const { authorizedUser } = context;
        if (!authorizedUser) {
          throw new Error("Unauthorized");
        }
        if (!args.content || !args.title) {
          throw new Error("All fields are required");
        }
        args.slug = args.slug
          ? slugify(args.slug.toLowerCase())
          : slugify(args.title.toLowerCase());

        const { slug } = await checkSlugExist(args.slug, prisma);

        const createPost = await prisma.post.create({
          data: {
            title: args.title,
            content: args.content,
            slug: slug,
            authorId: authorizedUser.id,
            categoryId: args.categoryId,
          },
        });
        const post = await prisma.post.findUnique({
          where: {
            id: createPost.id,
          },
          include: {
            author: true,
            category: true,
          },
        });
        return post;
      } catch (error) {
        throw new Error(error);
      }
    },
    pulishPost: async (parent, args, context) => {
      const { authorizedUser } = context;
      if (!authorizedUser) {
        throw new Error("Unauthorized");
      }
      const postFound = await prisma.post.findUnique({
        where: {
          id: String(args.id),
        },
      });
      if (!postFound) {
        throw new Error("Post not found");
      }
      await prisma.post.update({
        where: {
          id: String(args.id),
        },
        data: {
          published: true,
        },
      });
      return {
        success: true,
        message: "Post published successfully",
      };
    },
    deletePost: async (_, { id }, context) => {
      try {
        const { authorizedUser } = context;
        if (!authorizedUser) {
          throw new Error("Unauthorized");
        }
        const postFound = await prisma.post.findUnique({
          where: {
            id: String(id),
            deletedAt: { isSet: false },
          },
        });
        if (!postFound) {
          throw new Error("Post not found");
        }
        await prisma.post.update({
          where: {
            id: String(id),
          },
          data: {
            deletedAt: new Date(),
          },
        });
        return {
          success: true,
          message: "Post deleted successfully",
        };
      } catch (error) {
        throw new Error(error);
      }
    },
  },
};

export const checkSlugExist = async (slug, prisma) => {
  let existingSlug = await prisma.post.findUnique({
    where: { slug: slug },
  });

  if (!existingSlug) {
    return { slug: slugify(slug), isExist: false };
  }

  for (let slugIndex = 1; ; slugIndex++) {
    existingSlug = await prisma.post.findUnique({
      where: { slug: `${slug}-${slugIndex}` },
    });
    if (!existingSlug) {
      slug = `${slug}-${slugIndex}`;
      break;
    }
  }

  return { slug: slug, isExist: true };
};
