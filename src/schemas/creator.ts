import { Knex } from 'knex'

export const createSchema = async ({ knex, schemaName }: { knex: any; schemaName: string }): Promise<Knex> =>
  knex.raw(`CREATE SCHEMA IF NOT EXISTS :schemaName:`, { schemaName })
