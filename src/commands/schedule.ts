import {
    ActionRowBuilder,
    BaseMessageOptions,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    CacheType,
    CommandInteraction,
    ComponentType,
    EmbedBuilder,
    Guild,
    InteractionCollector,
    SlashCommandBuilder,
    Snowflake,
} from 'discord.js';
import { Command } from './command';

const DEFAULT_DESCRIPTION = 'When do thing?';
const DAYS = ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'Monday'] as const;

enum Options {
    Description = 'description',
}

interface Schedule {
    messageId: string;
    collector: InteractionCollector<ButtonInteraction<CacheType>>;

    description: string;
    created: number;
    votes: Record<string, Set<Snowflake>>;
}

const schedules: Schedule[] = [];

const command: Command = {
    data: new SlashCommandBuilder()
        .setName('schedule')
        .setDescription('Vote when to do a thing')
        .addStringOption((option) => option.setName(Options.Description).setDescription('What thing are we doing?')),

    async execute(interaction: CommandInteraction) {
        if (!interaction.guild) {
            interaction.reply({ content: 'Where are you?!', ephemeral: true });
            return;
        }

        const description = interaction.options.get(Options.Description)?.value?.toString() ?? DEFAULT_DESCRIPTION;

        const message = await getMessage(interaction.guild, description);
        const reply = await interaction.reply({
            ...message,
            fetchReply: true,
        });

        const collector = reply.createMessageComponentCollector({ componentType: ComponentType.Button });

        const schedule = createSchedule(reply.id, description, collector);

        collector.on('collect', async (i) => {
            if (!i.guild) {
                i.reply({ content: 'Where are you?!', ephemeral: true });
                return;
            }

            const day = getDay(i.customId);
            toggleDay(schedule, day, i.user.id);

            i.update(await getMessage(i.guild, schedule));
        });
    },
};
export default command;

function createSchedule(
    messageId: Snowflake,
    description: string,
    collector: InteractionCollector<ButtonInteraction<CacheType>>,
) {
    const votes = Object.fromEntries(DAYS.map((day) => [day, new Set<Snowflake>()]));

    const schedule: Schedule = {
        messageId,
        collector,
        description,
        created: Date.now(),
        votes,
    };

    schedules.push(schedule);
    return schedule;
}

async function getMessage(guild: Guild, scheduleOrDescription: Schedule | string): Promise<BaseMessageOptions> {
    let description: string;
    let schedule: Schedule | undefined;
    if (typeof scheduleOrDescription === 'string') {
        description = scheduleOrDescription;
    } else {
        schedule = scheduleOrDescription;
        description = schedule.description;
    }

    const embed = new EmbedBuilder()
        .setTitle(description)
        .setTimestamp(schedule ? new Date(schedule.created) : new Date());

    if (schedule) {
        for (const [day, votes] of Object.entries(schedule.votes)) {
            if (votes.size === 0) {
                continue;
            }

            const voters = await Promise.all([...votes.values()].map(async (id) => getNickname(guild, id)));

            embed.addFields({
                inline: true,
                name: `${day} (${votes.size})`,
                value: voters.join('\n'),
            });
        }
    }

    const row1 = getButtons(guild, schedule, DAYS.slice(0, 4));
    const row2 = getButtons(guild, schedule, DAYS.slice(4));

    return {
        embeds: [embed],
        components: [row1, row2],
    };
}

function getButtons(guild: Guild, schedule: Schedule | undefined, days: string[]) {
    const raidSize = getRaidSize();
    const row = new ActionRowBuilder<ButtonBuilder>();

    for (const day of days) {
        const votes = schedule?.votes[day]?.size ?? 0;
        const style = votes >= raidSize ? ButtonStyle.Success : ButtonStyle.Primary;
        const emoji = votes === raidSize - 1 ? getAlmostEmoji(guild) : null;

        const button = new ButtonBuilder().setCustomId(`schedule.${day}`).setLabel(day).setStyle(style);

        if (emoji) {
            button.setEmoji({ id: emoji.id });
        }

        row.addComponents(button);
    }

    return row;
}

function getAlmostEmoji(guild: Guild) {
    return guild.emojis.cache.find((e) => e.name === process.env.ALMOST_EMOJI);
}

function getDay(buttonId: string): string {
    return buttonId.replace('schedule.', '');
}

function toggleDay(schedule: Schedule, day: string, member: Snowflake) {
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

function getRaidSize() {
    return parseInt(process.env.RAID_SIZE ?? '8');
}
