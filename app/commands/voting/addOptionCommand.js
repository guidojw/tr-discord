'use strict'
const Command = require('../../controllers/command')

module.exports = class AddOptionCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'voting',
            name: 'addoption',
            description: 'Adds a vote option with given name and description.',
            clientPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES'],
            args: [{
                key: 'name',
                type: 'string',
                prompt: ''
            }, {
                key: 'description',
                type: 'string',
                prompt: ''
            }]
        })
    }

    execute (message, { name, description }, guild) {

    }
}
