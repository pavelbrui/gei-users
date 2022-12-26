import { FieldResolveInput } from 'stucco-js';
import { verify } from 'jsonwebtoken';
import { DB } from './db/mongo';
import crypto from 'crypto';
import { UserCollection } from './db/collections';
import { ResolverInputTypes } from './zeus';

export type UserModel = {
  username: string;
  team: string[];
  isEmailConfirmed: boolean;
  passwordHash: string;
  salt: string;
};

const decodeToken = (token: string) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT secret not set');
  }
  const verifiedToken = verify(token, process.env.JWT_SECRET);
  if (typeof verifiedToken !== 'object') {
    throw new Error('Token is not an object');
  }
  if (!('username' in verifiedToken)) {
    throw new Error('Invalid token');
  }
  return verifiedToken as { username: string };
};

export const getUser = async (token: string): Promise<UserModel | undefined> => {
  const db = await DB();
  const col = await db.collection<UserModel>(UserCollection);
  const { username } = decodeToken(token);
  const user = await col.findOne({
    username,
  });
  if (!user) {
    return;
  }
  return user;
};
export const getUserFromHandlerInput = async (input: FieldResolveInput): Promise<UserModel | undefined> => {
  if (!input.protocol?.headers) {
    return;
  }
  const { Authorization }: { Authorization?: string[] } = input.protocol.headers;
  if (!Authorization) {
    return;
  }
  const findUser = await getUser(Authorization[0]);
  if (!findUser) {
    return;
  }
  return findUser;
};

export const getUserFromHandlerInputOrThrow = async (input: FieldResolveInput): Promise<UserModel> => {
  const user = await getUserFromHandlerInput(input);
  if (!user) {
    throw new Error('You are not logged in');
  }
  return user;
};

const isUserSource = (u: unknown): u is UserModel => isNotNullObject(u) && typeof u.username === 'string';

type Args<T extends keyof ResolverInputTypes, Z extends keyof ResolverInputTypes[T]> = Required<
  ResolverInputTypes[T]
>[Z] extends [infer Input, unknown]
  ? Input
  : never;
type UserArgs<T extends keyof ResolverInputTypes, Z extends keyof ResolverInputTypes[T]> = Args<T, Z> & {
  user: UserModel;
};

export const isNotNullObject = (v: unknown): v is Record<string | number | symbol, unknown> =>
  typeof v === 'object' && v !== null;

export const resolverForUser =
  <T extends keyof ResolverInputTypes, Z extends keyof ResolverInputTypes[T], X = unknown>(
    _1: T,
    _2: Z,
    fn: (args: UserArgs<T, Z>, input: FieldResolveInput) => X,
  ) =>
  async (args: unknown, input: FieldResolveInput) => {
    if (!input.protocol?.headers?.Authorization) throw new Error('token does not exists in headers');
    const { protocol: { headers = {} } = {} } = input || {};
    const user = await getUser(headers.Authorization[0]);
    if (!isUserSource(user)) throw new Error('invalid user');
    const o = isNotNullObject(args) ? args : {};
    return fn({ ...o, user } as UserArgs<T, Z>, input);
  };

export const isAdmin = async (username: string): Promise<boolean> => {
  if (username === process.env.SUPERADMIN) {
    return true;
  }
  const db = await DB();
  const adminExists = await db.collection('Admin').findOne({
    username,
  });
  return !!adminExists;
};

export const isAdminOrThrow = async (input: FieldResolveInput): Promise<void> => {
  const user = await getUserFromHandlerInputOrThrow(input);
  const admin = await isAdmin(user.username);
  if (!admin) {
    throw new Error('Only administrator of the system can access this endpoint');
  }
};

export const comparePasswords = ({ password, hash, salt }: { password: string; hash: string; salt: string }) => {
  return hash === passwordSha512(password, salt).passwordHash;
};

export const passwordSha512 = (password: string, salt: string) => {
  const hash = crypto.createHmac('sha512', salt);
  hash.update(password);
  const passwordHash = hash.digest('hex');
  return {
    salt,
    passwordHash,
  };
};
