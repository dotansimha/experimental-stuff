import { makeExecutableSchema } from "@graphql-tools/schema";
import { LocalDbInstance } from "./local-db";

export const LOCAL_SCHEMA = makeExecutableSchema<{ db: LocalDbInstance }>({
  typeDefs: /* GraphQL */ `
    type Query {
      root: RootBlock!
      block(id: ID!): Block!
    }

    interface Block {
      id: ID!
      children: [Block!]
    }

    type RootBlock implements Block {
      id: ID!
      children: [Block!]
    }

    type PageBlock implements Block {
      id: ID!
      children: [Block!]

      title: String!
    }

    type TableBlock implements Block {
      id: ID!
      children: [Block!]

      name: String!
      store: TableStore!
    }

    type TableStore {
      id: ID!
      subgraph: String!
    }
  `,
  inheritResolversFromInterfaces: true,
  resolvers: {
    Query: {
      root: (_, __, { db }) =>
        db
          .get(`SELECT * FROM blocks WHERE type = 'root'`)
          .then(({ data, ...rest }) => ({ ...rest, data: JSON.parse(data) })),
      block: (_, { id }, { db }) =>
        db
          .get(`SELECT * FROM blocks WHERE id = :id`, {
            ":id": id,
          })
          .then(({ data, ...rest }) => ({ ...rest, data: JSON.parse(data) })),
    },
    Block: {
      id: (obj) => obj.id,
      children: (obj, _, { db }) => {
        const children = obj.children
          ? JSON.parse(obj.children).map((id) =>
              db
                .get(`SELECT * FROM blocks WHERE id = :id`, {
                  ":id": id,
                })
                .then(({ data, ...rest }) => ({
                  ...rest,
                  data: JSON.parse(data),
                }))
            )
          : null;

        return children;
      },
    },
    RootBlock: {
      __isTypeOf: (obj) => obj && obj.type === "root",
    },
    TableBlock: {
      __isTypeOf: (obj) => obj && obj.type === "table",
      name: (obj) => obj.data.name || "",
      store: (obj) => ({
        id: obj.data.storeId,
        subgraph: obj.data.subgraph,
      }),
    },
    PageBlock: {
      __isTypeOf: (obj) => obj && obj.type === "page",
      title: (obj) => obj.data.title || "",
    },
  },
});
