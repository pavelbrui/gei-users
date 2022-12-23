import { FieldResolveInput } from 'stucco-js';
import { resolverForUser } from '../UserMiddleware';
import { DB } from '../db/mongo';
import { TeamCollection, TeamInvitationsCollection, UserCollection } from '../db/collections';
import { InvationTeamStatus } from './sendInvitationToTeam';

export const handler = async (input: FieldResolveInput) =>
  resolverForUser('Mutation', 'joinToTeam', async ({ user, teamName }) => {
    const db = await DB();
    const invitation = await db
      .collection(TeamInvitationsCollection)
      .findOne({ team: teamName, recipient: user.username, status: InvationTeamStatus.Waiting });
    if (!invitation) {
      throw new Error('team invitation does not exists or captured');
    }
    await Promise.all([
      await db
        .collection(TeamInvitationsCollection)
        .updateOne({ team: teamName, recipient: user.username }, { $set: { status: InvationTeamStatus.Taken } }),
      await db.collection(TeamCollection).updateOne({ name: teamName }, { $push: { members: user.username } }),
      await db.collection(UserCollection).updateOne({ username: user.username }, { $push: { team: teamName } }),
    ]);
    return true;
  })(input.arguments, input);
