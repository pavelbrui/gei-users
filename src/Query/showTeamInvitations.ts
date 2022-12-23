import { FieldResolveInput } from 'stucco-js';
import { resolverForUser } from '../UserMiddleware';
import { DB } from '../db/mongo';
import { TeamInvitationsCollection } from '../db/collections';
import { stat } from 'fs';

export const handler = async (input: FieldResolveInput) =>
  resolverForUser('Query', 'showTeamInvitations', async ({ user }, status) => {
    console.log(status);
    const invitations = await DB().then(async (db) =>
      (
        await db.collection(TeamInvitationsCollection).find({ recipient: user.username }).toArray()
      ).map((inviton) => ({
        recipient: inviton.recipient,
        team: inviton.team,
      })),
    );
    return invitations || [];
  })(input.arguments, input);
