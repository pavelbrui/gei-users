import { FieldResolveInput } from 'stucco-js';
import { resolverForUser } from '../UserMiddleware';
import { DB } from '../db/mongo';
import { TeamCollection, TeamInvitationsCollection } from '../db/collections';
import { Db } from 'mongodb';

export const InvationTeamStatus = {
  Waiting: 'Waiting',
  Taken: 'Taken',
};

export const isUserOwnerOfTeam = async (username: string, db: Db, team: string) =>
  (await db.collection(TeamCollection).findOne({ owner: username, name: team })) ? true : false;

export const handler = async (input: FieldResolveInput) =>
  resolverForUser('Mutation', 'sendInvitationToTeam', async ({ user, invitation: { username, team } }) => {
    const db = await DB();
    if (
      await db
        .collection(TeamInvitationsCollection)
        .findOne({ team, recipient: username, status: InvationTeamStatus.Waiting })
    )
      throw new Error('current user think about acceptation');
    if (!(await isUserOwnerOfTeam(user.username, db, team))) throw new Error('user is not owner of team');
    await db
      .collection(TeamInvitationsCollection)
      .insertOne({ team, recipient: username, status: InvationTeamStatus.Waiting });
    return true;
  })(input.arguments, input);
