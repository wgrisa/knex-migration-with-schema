import Knex, { Migration, MigrationSource } from 'knex'
import { promises } from 'fs'

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
  const migrationSource = buildMigrationSource({ schemaName, migrations })

  return knex.migrate
    .latest({
      schemaName,
      migrationSource,
    })
    .catch((error) => {
      return error
    })
}

export const executeSchemaMigrationFromDir = async ({
  knex,
  schemaName,
  directory,
}: {
  knex: Knex
  schemaName: string
  directory: string
}): Promise<any> => {
  let fileNames
  try {
    fileNames = await promises.readdir(directory)
  } catch {
    return `Could not read directory "${directory}"`
  }

  const mgs: Migrations = {}

  for (const filename of fileNames) {
    const filePath = `${directory}/${filename}`
    await import(filePath).then((migration) => {
      mgs[filename] = migration.default
    })
  }

  const migrationSource = buildMigrationSource({ schemaName, migrations: mgs })

  return knex.migrate
    .latest({
      schemaName,
      migrationSource,
    })
    .catch((error) => {
      return error
    })
}

const buildMigrationSource = ({
  schemaName,
  migrations,
}: {
  schemaName: string
  migrations?: Migrations
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
