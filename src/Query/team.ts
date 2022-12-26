import { FieldResolveInput } from 'stucco-js';
import { resolverForUser } from '../UserMiddleware';
import { DB } from '../db/mongo';
import { TeamCollection } from '../db/collections';

export const handler = async (input: FieldResolveInput) =>
  resolverForUser('Query', 'team', async ({ user, teamName }) => {
    const db = await DB();
    if (user.team.find((team) => team === teamName)) {
      return await db.collection(TeamCollection).findOne({ name: teamName });
    }
  })(input.arguments, input);
