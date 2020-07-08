import Knex, { Migration } from 'knex'

export default (schemaName: string): Migration => ({
  async up(knex: Knex) {
    return knex.schema.withSchema(schemaName).createTable('customers', (table) => {
      table.increments('id').primary()
      table.text('name').notNullable()
    })
  },
  async down(knex: Knex) {
    return knex.schema.withSchema(schemaName).dropTableIfExists('customers')
  },
})
