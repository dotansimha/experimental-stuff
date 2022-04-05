import { createLocalApi } from "./local-api";
import { createLocalDb } from "./local-db";
import { LOCAL_SCHEMA } from "./local-schema";
import { ROOT_BLOCK } from "./queries";
import { migrate } from "./app.migration";
import { printSchema } from "graphql";
import { inspect } from "util";

const print = (o) => console.log(inspect(o, false, null, true));

async function main() {
  /**
   * This following section creates the Application database.
   * The application database is basically where we store the application data (pages, blocks, data and so on).
   *
   * NOTE: This function also runs the "migrate" function to create some base data so we can later use.
   */
  const db = await createLocalDb({
    filename: "./tmp/app.db",
    migrate,
  });
  /**
   * The local API is a wrapper for the entire application needs.
   * It provides a GraphQL schema and API for creating more data stores dynamically.
   *
   * NOTE: The application schema is hand-written (see LOCAL_SCHEMA) to make it tailor-made to the application needs,
   * and not depends on a generated schema.
   */
  const api = createLocalApi({ db, schema: LOCAL_SCHEMA });
  console.log(`The following is the data the Application manages:`);
  print(await api.execute(ROOT_BLOCK));

  /**
   * In the seed data, we created a "table" block with a reference data store.
   * The data store is based on "storeId" which is the external identifier, and also a Subgraph SDL
   * that defines it's structure.
   *
   * Calling `getStore` will basically do:
   * 1. Create a new local SQLite database for the data store.
   * 2. Convert the Subgraph SDL into a SQL schema creation statement for all the tables.
   * 3. Create a GraphQL schema on-the-fly for the purpose of making it easy to work with.
   */
  const store = await api.getStore("my_data_source");
  console.log(
    `The following is the GraphQL schema for the "my_data_source" store:`,
    printSchema(store.schema)
  );

  /**
   * The following is running a mutation to create "Sender" entity in the local store of "my_data_source".
   */
  await store.execute(
    /* GraphQL */ `
      mutation createSender($address: String!) {
        createSender(address: $address, createdAt: 1) {
          id
        }
      }
    `,
    {
      address: "123456",
    }
  );
  /**
   * The following is running a mutation to create "Purpose" entity in the local store of "my_data_source".
   */
  await store.execute(
    /* GraphQL */ `
      mutation createPurpose($sender: Int!, $purpose: String!) {
        createPurpose(
          sender: $sender
          purpose: $purpose
          createdAt: 1
          transactionHash: ""
        ) {
          id
        }
      }
    `,
    {
      sender: 1,
      purpose: "Test 1",
    }
  );

  /**
   * The following queries for the entire data we have right now in the "my_data_source" store.
   */
  const purposes = await store.execute(/* GraphQL */ `
    query purposes {
      purposes {
        id
        name
        sender {
          id
          address
        }
      }
    }
  `);

  console.log(`This is the data the "my_data_source" store has right now:`);
  print(purposes.data);
}

main().catch(console.error);
