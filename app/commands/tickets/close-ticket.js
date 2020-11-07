'use strict'
const Command = require('../../controllers/command')
const discordService = require('../../services/discord')

const { stripIndents } = require('common-tags')
const { TicketState } = require('../../controllers/ticket')

const applicationConfig = require('../../../config/application')

module.exports = class CloseTicketCommand extends Command {
  constructor (client) {
    super(client, {
      group: 'tickets',
      name: 'closeticket',
      aliases: ['close'],
      description: 'Closes this ticket.',
      clientPermissions: ['ADD_REACTIONS', 'SEND_MESSAGES', 'MANAGE_CHANNELS']
    })
  }

  async execute (message, _args, guild) {
    const ticketsController = this.client.bot.ticketsController

    // Check if the channel is actually a ticket channel
    const channels = guild.getData('channels')
    if (message.channel.parentID !== channels.ticketsCategory) {
      return message.reply('This command can only be used in channels in the tickets category.')
    }

    // Get the channel's TicketController
    const ticketController = ticketsController.getTicketFromChannel(message.channel)
    if (ticketController) {
      // Prompt the user if they really want to close the ticket
      const prompt = await message.channel.send('Are you sure you want to close this ticket?')
      const choice = await discordService.prompt(message.channel, message.author, prompt, ['✅', '🚫']) ===
        '✅'

      if (choice) {
        // Log the action
        await this.client.bot.log(message.author, stripIndents`
        ${message.author} **closed ticket** \`${ticketController.id}\`
        ${message.content}
        `, `Ticket ID: ${ticketController.id}`)

        if ((ticketController.state === TicketState.SUBMITTING_REPORT || ticketController.state === TicketState
          .CONNECTED) && message.author === ticketController.author) {
          return ticketController.close('Ticket successfully closed.', false, applicationConfig.primaryColor)
        } else if (message.author !== ticketController.author) {
          return ticketController.close('The moderator has closed your ticket.', true, applicationConfig.primaryColor)
        }
      }
    }
  }
}
