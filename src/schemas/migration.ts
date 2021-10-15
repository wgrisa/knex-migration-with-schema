import { promises } from 'fs'
import { Knex } from 'knex'

export interface Migrations {
  [migrationName: string]: (schemaName: string) => Knex.Migration
}

const buildMigrationSource = ({
  schemaName,
  migrations,
}: {
  schemaName: string
  migrations: Migrations
}): Knex.MigrationSource<any> => ({
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

export const executeSchemaMigration = ({
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
  let fileNames: string[]

  try {
    fileNames = await promises.readdir(directory)
  } catch {
    return `Could not read directory "${directory}"`
  }

  const migrations: Migrations = {}

  for (const filename of fileNames) {
    const filePath = `${directory}/${filename}`

    await import(filePath).then((migration) => {
      migrations[filename] = migration.default
    })
  }

  return executeSchemaMigration({ knex, schemaName, migrations })
}
