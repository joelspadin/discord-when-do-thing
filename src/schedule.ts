import {
    ApplicationCommandData,
    ButtonInteraction,
    Client,
    CommandInteraction,
    Guild,
    GuildEmoji,
    InteractionReplyOptions,
    MessageActionRowComponentResolvable,
    MessageEmbed,
    Snowflake,
} from 'discord.js';

const RAID_SIZE = parseInt(process.env.RAID_SIZE ?? '8');
const ALMOST_EMOJI = process.env.ALMOST_EMOJI;

const DAYS = ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'Monday'] as const;
type Day = typeof DAYS[number];

interface Schedule {
    description: string;
    created: number;
    votes: Record<Day, Set<Snowflake>>;
}

const schedules: Record<string, Schedule> = {};

export const SCHEDULE_COMMAND: ApplicationCommandData = {
    name: 'schedule',
    description: 'Vote when to do a thing',
    options: [
        {
            name: 'description',
            type: 'STRING',
            description: 'What thing are we doing?',
        },
    ],
};

export async function createSchedule(client: Client, interaction: CommandInteraction) {
    if (!interaction.guild) {
        await interaction.reply({ content: 'Where are you?!', ephemeral: true });
        return;
    }

    const description = interaction.options.get('description')?.value?.toString() ?? 'When do thing?';

    const message = await getMessage(interaction.guild, description);
    const reply = await interaction.reply({
        ...message,
        fetchReply: true,
    });

    addSchedule(reply.id, description);
}

export async function handleScheduleReply(client: Client, interaction: ButtonInteraction) {
    const schedule = schedules[interaction.message.id];
    if (!schedule) {
        await interaction.reply({ content: 'This schedule can no longer be voted on', ephemeral: true });
        return;
    }

    if (!interaction.member) {
        await interaction.reply({ content: 'Who are you?!', ephemeral: true });
        return;
    }

    if (!interaction.guild) {
        await interaction.reply({ content: 'Where are you?!', ephemeral: true });
        return;
    }

    const day = getDay(interaction.customID);

    toggleDay(schedule, day, interaction.member.user.id);

    const message = await getMessage(interaction.guild, schedule);
    await interaction.update(message);
}

async function getMessage(guild: Guild, scheduleOrDescription: Schedule | string): Promise<InteractionReplyOptions> {
    let description: string;
    let schedule: Schedule | undefined;
    if (typeof scheduleOrDescription === 'string') {
        description = scheduleOrDescription;
    } else {
        schedule = scheduleOrDescription;
        description = schedule.description;
    }

    const embed = new MessageEmbed({
        createdAt: schedule ? new Date(schedule.created) : new Date(),
        title: description,
    });

    if (schedule) {
        for (const key in schedule.votes) {
            const day = key as Day;
            const votes = schedule.votes[day];

            if (votes.size === 0) {
                continue;
            }

            const voters = await Promise.all([...votes.values()].map(async (id) => getNickname(guild, id)));

            embed.fields.push({
                inline: true,
                name: `${day} (${votes.size})`,
                value: voters.join('\n'),
            });
        }
    }

    const buttons = DAYS.map((day) => getButton(day, guild, schedule?.votes[day]));

    return {
        embeds: [embed],
        components: [
            {
                type: 1,
                components: buttons.slice(0, 4),
            },
            {
                type: 1,
                components: buttons.slice(4),
            },
        ],
    };
}

function getButton(day: string, guild: Guild, votes?: Set<Snowflake>): MessageActionRowComponentResolvable {
    let style = 2;
    let emoji: GuildEmoji | undefined;

    if (votes) {
        if (votes.size >= RAID_SIZE) {
            style = 3;
        } else if (votes.size === RAID_SIZE - 1) {
            emoji = guild.emojis.cache.find((e) => e.name === ALMOST_EMOJI);
        }
    }

    return {
        type: 2,
        label: day,
        style,
        emoji,
        customID: `schedule.${day}`,
    };
}

function addSchedule(messageId: Snowflake, description: string) {
    const votes = Object.assign({}, ...DAYS.map((day) => ({ [day]: new Set<Snowflake>() })));

    schedules[messageId] = {
        description,
        created: Date.now(),
        votes,
    };
}

function getDay(buttonId: string): Day {
    return buttonId.replace('schedule.', '') as Day;
}

function toggleDay(schedule: Schedule, day: Day, member: Snowflake) {
    const votes = schedule.votes[day];

    if (votes.has(member)) {
        votes.delete(member);
    } else {
        votes.add(member);
    }

    return votes.has(member);
}

async function getNickname(guild: Guild, id: Snowflake) {
    const member = await guild.members.fetch(id);
    return member.nickname ?? member.user.username;
}
