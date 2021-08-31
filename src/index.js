const { ApolloServer } = require("apollo-server");
const { PrismaClient } = require("@prisma/client");

const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

let links = [
  {
    id: "link-0",
    url: "www.howtographql.com",
    description: "Fullstack tutorial for GraphQL",
  },
];

const resolvers = {
  Query: {
    info: () => `This is the API of a Hackernews Clone`,
    feed: async (parent, args, context) => {
      return context.prisma.link.findMany();
    },
    link: (parent, args) => links.find((e) => e.id === args.id),
  },
  Mutation: {
    post: async (parent, args, context, info) => {
      const newLink = await context.prisma.link.create({
        data: {
          url: args.url,
          description: args.description,
        },
      });
      return newLink;
    },
    updateLink: (parent, args) => {
      // find the element
      const element = links.find((e) => e.id === args.id);
      // find element index
      const indexOfElement = links.findIndex((e) => e.id === args.id);
      // return null if index = -1
      if (indexOfElement === -1) return null;
      // modify the element
      if (args.url) links[indexOfElement].url = args.url;
      if (args.description)
        links[indexOfElement].description = args.description;
      // return the element
      return links[indexOfElement];
    },
    deleteLink: (parent, args) => {
      // find element
      const element = links.find((e) => e.id === args.id);
      // find element index
      const indexOfElement = links.findIndex((e) => e.id === args.id);
      // return null if index = -1
      if (indexOfElement === -1) return null;
      // deleting the element
      delete links[indexOfElement];
      // return the element
      return element;
    },
  },
  Link: {
    id: (parent) => parent.id,
    description: (parent) => parent.description,
    url: (parent) => parent.url,
  },
};

const server = new ApolloServer({
  typeDefs: fs.readFileSync(path.join(__dirname, "schema.graphql"), "utf8"),
  resolvers,
  context: {
    prisma,
  },
});

server.listen().then(({ url }) => console.log(`Server is running on ${url}`));
