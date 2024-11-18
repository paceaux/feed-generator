import { QueryParams } from '../lexicon/types/app/bsky/feed/getFeedSkeleton'
import { AppContext } from '../config'
import { getWordList, getAdjacentWords, getPronounPlacement, hasProfanity } from '../util/discourse'

// max 15 chars
export const shortname = 'guy'

export const handler = async (ctx: AppContext, params: QueryParams) => {
  let builder = ctx.db
    .selectFrom('post')
    .selectAll()
    .where('pronoun', '=', 'guy')
    .orderBy('indexedAt', 'desc')
    .orderBy('cid', 'desc')
    .limit(params.limit)

  if (params.cursor) {
    const timeStr = new Date(parseInt(params.cursor, 10)).toISOString()
    builder = builder.where('post.indexedAt', '<', timeStr)
  }
  const res = await builder.execute()

  const feed = res.map((row) => ({
      post: row.uri,
      pronoun: row.pronoun,
      placement: getPronounPlacement(row.text, row.pronoun),
      adjacentWords: getAdjacentWords(getWordList(row.text), row.pronoun),
      hasProfanity: hasProfanity(row.text),
      length: getWordList(row.text).length,
      text: row.text,
    }))

  let cursor: string | undefined
  const last = res.at(-1)
  if (last) {
    cursor = new Date(last.indexedAt).getTime().toString(10)
  }

  return {
    cursor,
    feed,
  }
}
