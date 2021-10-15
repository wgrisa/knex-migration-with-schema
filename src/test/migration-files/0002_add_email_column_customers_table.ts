import { Knex } from 'knex'

export default (schemaName: string): Knex.Migration => ({
  async up(knex: Knex) {
    return knex.schema.withSchema(schemaName).table('customers', (table) => {
      table.text('email')
    })
  },
  async down(knex: Knex) {
    return knex.schema.withSchema(schemaName).table('customers', (table) => {
      table.dropColumn('email')
    })
  },
})
