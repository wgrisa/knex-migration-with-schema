import Knex, { Migration, MigrationSource } from 'knex'
import { readdirSync } from 'fs'

export interface Migrations {
  [migrationName: string]: (schemaName: string) => Migration
}

export const executeSchemaMigration = async ({
  knex,
  schemaName,
  migrations,
  migrationDirectory,
}: {
  knex: Knex
  schemaName: string
  migrations?: Migrations
  migrationDirectory?: string
}): Promise<any> => {
  let migrationSource

  if (migrationDirectory) {
    const fullpath = `${__dirname}/../../${migrationDirectory}/`

    const fileNames = readdirSync(fullpath)
    const mgs: Migrations = {}
    console.log('oi')
    for (const filename of fileNames) {
      const file = `${fullpath}/${filename}`
      console.log('file ===>', file)

      await import(file).then((migration) => {
        mgs[filename] = migration.default
      })
    }
    console.log('mgs', JSON.stringify(mgs, null, 2))

    migrationSource = buildMigrationSource({ schemaName, migrations: mgs })
  } else {
    migrationSource = buildMigrationSource({ schemaName, migrations })
  }

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
