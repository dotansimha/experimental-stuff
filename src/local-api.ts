import { execute, GraphQLSchema, parse } from "graphql";
import { createLocalDb, LocalDbInstance } from "./local-db";
import { generateSQLSchema } from "./graphql-to-sql";
import { buildSchemaFromDatabase } from "tuql";

export function createLocalApi(options: {
  schema: GraphQLSchema;
  db: LocalDbInstance;
}) {
  return {
    async getStore(storeId: string) {
      const storeRecord = await options.db
        .get(
          `SELECT * FROM blocks WHERE type = 'table' AND json_extract(data, '$.storeId') = :storeId`,
          {
            ":storeId": storeId,
          }
        )
        .then((r) => {
          if (!r) {
            throw new Error(
              `Failed to located a store with storeId="${storeId}"`
            );
          }

          return r;
        })
        .then(({ data, ...rest }) => ({
          ...rest,
          data: JSON.parse(data),
        }));

      const dbFile = `./tmp/${storeRecord.id}.sqlite`;
      const dbInstance = await createLocalDb({
        filename: dbFile,
        migrate: async (db) => {
          const sqlSchema = await generateSQLSchema({
            source: storeRecord.data.subgraph,
          });

          console.log(sqlSchema);

          await db.exec(sqlSchema);
        },
      });

      const schema = await buildSchemaFromDatabase(dbFile);

      return {
        schema,
        async execute(query: string, variables: Record<string, any> = {}) {
          return execute({
            document: parse(query),
            variableValues: variables,
            schema: schema,
          });
        },
        dbInstance,
        dbRecord: storeRecord,
      };
    },
    async execute(query: string, variables: Record<string, any> = {}) {
      return execute({
        document: parse(query),
        variableValues: variables,
        contextValue: {
          db: options.db,
        },
        schema: options.schema,
      });
    },
  };
}

export type LocalApi = ReturnType<typeof createLocalApi>;
