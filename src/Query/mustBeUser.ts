import { FieldResolveInput } from 'stucco-js';
import { getUserFromHandlerInputOrThrow } from '../UserMiddleware';
import { resolverFor } from '../zeus';

export const handler = async (input: FieldResolveInput) => getUserFromHandlerInputOrThrow(input);
