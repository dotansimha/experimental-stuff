import { createLocalApi } from "./local-api";
import { createLocalDb } from "./local-db";
import { LOCAL_SCHEMA } from "./local-schema";
import { ROOT_BLOCK } from "./queries";
import { migrate } from "./app-store";

async function main() {
  const db = await createLocalDb({
    filename: "./tmp/app.db",
    migrate,
  });
  const api = createLocalApi({ db, schema: LOCAL_SCHEMA });

  const response = await api.execute(ROOT_BLOCK);
  const store = await api.getStore("my_data_source");

  const purposes = await store.execute(`{ purposes { id name }}`);
  console.log(purposes.data);
}

main().catch(console.error);
