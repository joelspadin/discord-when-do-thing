import { Client, Permissions } from 'discord.js';

const permissions = new Permissions([Permissions.FLAGS.SEND_MESSAGES, Permissions.FLAGS.USE_APPLICATION_COMMANDS]);

export function getInviteLink(client: Client) {
    const params = new URLSearchParams({
        client_id: client.user?.id.toString()!,
        permissions: permissions.bitfield.toString(),
        scope: 'applications.commands bot',
    });
    return `https://discord.com/oauth2/authorize?${params}`;
}
