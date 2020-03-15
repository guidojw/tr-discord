'use strict'
const { MessageEmbed } = require('discord.js')
const pluralize = require('pluralize')

module.exports = async guild => {
    const members = await guild.guild.members.fetch()
    const premiumMembers = []
    for (const member of members) {
        if (member.premiumSince) premiumMembers.push(member)
    }

    const monthlyPremiumMembers = []
    const now = new Date()
    for (const member of premiumMembers) {
        const premiumDate = member.premiumSince
        if (premiumDate.getMonth() !== now.getMonth() && premiumDate.getDate() === now.getDate()) {
            monthlyPremiumMembers.push({
                member: member,
                months: now.getMonth() - premiumDate.getMonth() + (now.getFullYear() - premiumDate.getFullYear()) * 12
            })
        }
    }
    monthlyPremiumMembers.sort((a, b) => {
        return b.months - a.months
    })


    if (monthlyPremiumMembers.length > 0) {
        const embed = new MessageEmbed()
            .setTitle('Server Booster Report')
        for (const { member, months } of monthlyPremiumMembers) {
            embed.addField(member.tag, `Has been boosting this server for **${months}** ${pluralize('month', 
                months)}!`)
        }

        const channels = guild.getData('channels')
        const channel = guild.guild.channels.cache.get(channels.adminChannel)
        if (!channel) throw new Error('Cannot get channel.')
        channel.send(embed)
    }
}