import { FieldResolveInput } from 'stucco-js';
import { resolverForUser } from '../UserMiddleware';
import { DB } from '../db/mongo';
import { TeamCollection, TeamInvitationsCollection, UserCollection } from '../db/collections';

export const handler = async (input: FieldResolveInput) =>
  resolverForUser('Mutation', 'removeUserFromTeam', async ({ user, username }) => {
    const db = await DB();
    const team = await db.collection(TeamCollection).findOne({ owner: user.username });
    if (!team) {
      throw new Error('you are not owner of that team or team does not exists');
    }
    await Promise.all([
      await db.collection(TeamInvitationsCollection).deleteOne({ team: team.name, recipient: username }),
      await db.collection(UserCollection).updateOne({ username }, { $pull: { team: team.name } }),
      await db.collection(TeamCollection).updateOne({ name: team.name }, { $pull: { members: username } }),
    ]);
    return true;
  })(input.arguments, input);
