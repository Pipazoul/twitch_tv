import { Schema as S } from '@triplit/client';
import type { ClientSchema } from '@triplit/client';

/**
 * Define your schema here. After:
 * - Pass your schema to your Triplit client
 * - Push your schema to your Triplit server with 'triplit schema push'
 *
 * For more information about schemas, see the docs: https://www.triplit.dev/docs/schemas
 */
export const schema = {
  // todos: {
  //   schema: S.Schema({
  //     id: S.Id(),
  //     title: S.String(),
  //     description: S.String(),
  //   }),
  // },
  rooms: {
    schema: S.Schema({
      id: S.Id(),
      name: S.String(),
      channelHistory: S.Set(
        S.String()
      ),
      currentChannel: S.Optional(S.Record({
        name: S.String(),
        url: S.String(),
      })),
    })
  },
} satisfies ClientSchema;
