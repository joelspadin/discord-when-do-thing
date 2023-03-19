import { Client, PermissionsBitField } from 'discord.js';

const permissions = new PermissionsBitField([
    PermissionsBitField.Flags.SendMessages,
    PermissionsBitField.Flags.UseApplicationCommands,
]);

export function getInviteLink(client: Client) {
    const params = new URLSearchParams({
        client_id: client.user?.id.toString()!,
        permissions: permissions.bitfield.toString(),
        scope: 'applications.commands bot',
    });
    return `https://discord.com/oauth2/authorize?${params}`;
}
