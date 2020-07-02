import Knex, { Migration, MigrationSource } from 'knex'

export interface Migrations {
  [migrationName: string]: (schemaName: string) => Migration
}

export const executeSchemaMigration = async ({
  knex,
  schemaName,
  migrations,
}: {
  knex: Knex
  schemaName: string
  migrations: Migrations
}): Promise<any> => {
  return knex.migrate
    .latest({ schemaName, migrationSource: buildMigrationSource({ schemaName, migrations }) })
    .catch((error) => {
      return error
    })
}

const buildMigrationSource = ({
  schemaName,
  migrations,
}: {
  schemaName: string
  migrations: Migrations
}): MigrationSource<any> => ({
  getMigrations() {
    return Promise.resolve(Object.keys(migrations))
  },
  getMigrationName(migration) {
    return migration
  },
  getMigration(migration) {
    return migrations[migration](schemaName)
  },
})
