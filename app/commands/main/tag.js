'use strict'
const Command = require('../../controllers/command')
const discordService = require('../../services/discord')

const { MessageEmbed } = require('discord.js')

const applicationConfig = require('../../../config/application')

const tags = require('../../content/tags')

module.exports = class TagCommand extends Command {
  constructor (client) {
    super(client, {
      group: 'main',
      name: 'tag',
      description: 'Posts given tag.',
      examples: ['tag rr'],
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'name',
        type: 'string',
        prompt: 'What tag would you like to check out?'
      }]
    })
  }

  async execute (message, { name }, guild) {
    const names = name.split(' ')
    name = names.shift()

    if (name !== 'all') {
      const tag = tags.find(tag => tag.names.includes(name))

      if (!tag) {
        return message.reply('Couldn\'t find tag!')
      }
      if (tag.group === 'admin') {
        if (!discordService.isAdmin(message.member, guild.getData('adminRoles'))) {
          return message.reply('You do not have permission to see that tag.')
        } else {
          const channels = guild.getData('channels')
          if (message.channel.id !== channels.adminChannel && message.channel.id !== channels.botCommandsAdminChannel) {
            return message.reply('Wrong channel.')
          }
        }
      }

      // Don't reply but send instead to avoid confusion about for who the tag was requested.
      return message.channel.send(tag.tag)
    } else {
      let list = ''
      let count = 1
      for (const tag of tags) {
        for (const name of tag.names) {
          list += `${count}. ${name}\n`
          count++
        }
      }

      const embed = new MessageEmbed()
        .setTitle('Tags')
        .setDescription(list)
        .setFooter(`Page 1/1 (${count - 1} entries)`)
        .setColor(applicationConfig.primaryColor)
      return message.replyEmbed(embed)
    }
  }
}
