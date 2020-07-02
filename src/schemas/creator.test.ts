import { expect } from 'chai'
import Knex from 'knex'

import { config } from '../config'
import { createSchema } from './creator'

describe('schema creator', () => {
  describe('given a knex connection and a schema name', () => {
    const knex = Knex(config.knex)
    const schemaName = 'new_schema'

    const checkIfSchemaExists = async (schemaNameToValidate: string) =>
      !!(await knex('information_schema.schemata').where({ schema_name: schemaNameToValidate }).first())

    const dropSchema = async (schemaNameToDrop: string) =>
      knex.raw(`DROP SCHEMA IF EXISTS "${schemaNameToDrop}" CASCADE`)

    beforeEach(async () => {
      await dropSchema(schemaName)
    })

    it('creates a new schema', async () => {
      await createSchema({ knex, schemaName: schemaName })

      expect(await checkIfSchemaExists(schemaName)).to.be.true
    })

    it('does not create a new schema if it already exists', async () => {
      await createSchema({ knex, schemaName: schemaName })
      await createSchema({ knex, schemaName: schemaName })

      expect(await checkIfSchemaExists(schemaName)).to.be.true
    })

    describe('when trying to inject SQL through the schema name', () => {
      const sqlInjectionTry = `${schemaName}; SELECT 0x50 + 0x45;`

      beforeEach(async () => {
        await dropSchema(sqlInjectionTry)
      })

      it('creates the schema without executing any extra SQL code', async () => {
        const schemaCreationResult: any = await createSchema({ knex, schemaName: sqlInjectionTry })

        expect(schemaCreationResult.command).to.be.eql('CREATE')
        expect(await checkIfSchemaExists(sqlInjectionTry)).to.be.true
      })
    })
  })
})
