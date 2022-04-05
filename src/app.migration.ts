import { LocalDbInstance } from "./local-db";

export async function migrate(db: LocalDbInstance) {
  const existing_table = await db.get(
    `SELECT name FROM sqlite_master WHERE name = 'blocks' ORDER BY name;`
  );

  if (!existing_table) {
    await db.exec(/* sql */ `CREATE TABLE blocks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      children JSON,
      type CHAR(32) NOT NULL,
      data JSON NOT NULL
    )`);

    await db.run('INSERT INTO blocks (type, data) VALUES ("root", "{}")');
    await db.run('INSERT INTO blocks (type, data) VALUES ("page", :data)', {
      ":data": JSON.stringify({
        title: "Test Page",
      }),
    });
    await db.run('INSERT INTO blocks (type, data) VALUES ("table", :data)', {
      ":data": JSON.stringify({
        name: "My Data Source",
        storeId: "my_data_source",
        subgraph: /* GraphQL */ `
          type Purpose @entity {
            id: ID!
            sender: Sender!
            purpose: String!
            createdAt: Int!
            transactionHash: String!
          }

          type Sender @entity {
            id: ID!
            address: String!
            purposes: [Purpose!]! @derivedFrom(field: "sender")
            createdAt: Int!
          }
        `,
      }),
    });

    await db.run("UPDATE blocks SET children = :children WHERE id = 1", {
      ":children": JSON.stringify([2, 3]),
    });
  }
}
