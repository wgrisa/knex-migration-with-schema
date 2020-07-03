## Simplifies the execution of database migrations across different schemas with Knex

While [knex.js](https://github.com/knex/knex) supports the execution of queries across different schemas with the use of the `withSchema()` method, there's no simple way to run migration across different schemas programatically, sending the schema name as a parameter to the `knex.migrate()` command.

This library was created to address this issue.

### How to use

This library offers two functions, one to create new schemas, and one to execute migrations on a schema

#### 1. Creating new schemas

Import the `createSchema` method:

```js
import { createSchema } from './creator'
```

Create a schema by providing a `knex` connection and a `schemaName`. If the schema already exists, it will be skipped (no exceptions will be thrown)

```js
await createSchema({ knex, schemaName: 'users' })
```

#### 2. Executing migrations on a schema

Import the `executeSchemaMigration` method:

```js
import { executeSchemaMigration } from 'knex-migration-with-schema'
```

Execute the migrations passing as parameters an open knex database connection (`knex`), the name of the schema in which you want to (`schemaName`) and the migrations you want to execute, as a dictionary (`migrations`)

```js
const schemaName = 'users'

const userMigrations = {
  createUsersTable: (schemaName) => ({
    async up(knex) {
      return knex.schema.withSchema(schemaName).createTable('users', (table) => {
        table.increments('id').primary()
        table.text('email').notNullable().unique
      })
    },
    async down(knex) {
      return knex.schema.withSchema(schemaName).dropTableIfExists('users')
    },
  }),
}

await executeSchemaMigration({ knex, schemaName, migrations: userMigrations })
```

Note that the migrations dictionary has the name of the migration as key (the one that will be stored in the `knex_migrations` table), and the `up` and `down` functions as values.

To add new migrations you can simply expand this object; as expected, only the non-executed migrations will be performed:

```js
const userMigrations = {
  createUsersTable: (schemaName) => ({
    async up(knex) {
      return knex.schema.withSchema(schemaName).createTable('users', (table) => {
        table.increments('id').primary()
        table.text('email').notNullable().unique
      })
    },
    async down(knex) {
      return knex.schema.withSchema(schemaName).dropTableIfExists('users')
    },
  }),
  addUserNameColumn: (schemaName) => ({
    async up(knex) {
      return knex.schema.withSchema(schemaName).table('users', (table) => {
        table.text('user_name')
      })
    },
    async down(knex) {
      return knex.schema.withSchema(schemaName).table('users', (table) => {
        table.dropColumn('user_name')
      })
    },
  }),
)
```

You may want to store these migrations in a dedicated file and import them, or read for them from the filesystem (support to migrations from the filesystem may be supported in the future...your pull request is welcome! 😉)
