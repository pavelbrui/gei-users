import { FieldResolveInput } from 'stucco-js';
import { resolverForUser } from '../UserMiddleware';
import { DB } from '../db/mongo';
import { TeamCollection, UserCollection } from '../db/collections';

export const handler = async (input: FieldResolveInput) =>
  resolverForUser('Mutation', 'createTeam', async ({ user, teamName }) => {
    const db = await DB();
    if (await db.collection(TeamCollection).findOne({ name: teamName })) return false;
    await Promise.all([
      await db.collection(TeamCollection).insertOne({ owner: user.username, name: teamName, members: user.username }),
      await db.collection(UserCollection).updateOne({ username: user.username }, { $push: { team: teamName } }),
    ]);
    return true;
  })(input.arguments, input);
