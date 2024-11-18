import {
  OutputSchema as RepoEvent,
  isCommit,
} from './lexicon/types/com/atproto/sync/subscribeRepos'
import { FirehoseSubscriptionBase, getOpsByType } from './util/subscription';
import { hasPronounInText, getPronounFromText } from './util/pronouns';

export class FirehoseSubscription extends FirehoseSubscriptionBase {
  async handleEvent(evt: RepoEvent) {
    if (!isCommit(evt)) return

    const ops = await getOpsByType(evt)


    const supportedLanguages = ['en'];

    // filter out posts that are not in supported languages
    const postsForSupportedLanguages = ops.posts.creates.filter((post) => supportedLanguages.every((lang) => post?.record?.langs?.includes(lang)));


    const postsToDelete = ops.posts.deletes.map((del) => del.uri)
    const postsToCreate = postsForSupportedLanguages
      .filter((create) => hasPronounInText(create?.record?.text))
      .map((create) => {
        const pronoun = getPronounFromText(create?.record?.text);
        return {
          uri: create.uri,
          cid: create.cid,
          text: create.record.text,
          pronoun,
          indexedAt: new Date().toISOString(),
        }
      });
    
    for (const post of postsToCreate) {
      console.log(post);
    }

    if (postsToDelete.length > 0) {
      await this.db
        .deleteFrom('post')
        .where('uri', 'in', postsToDelete)
        .execute()
    }
    if (postsToCreate.length > 0) {
      await this.db
        .insertInto('post')
        .values(postsToCreate)
        .onConflict((oc) => oc.doNothing())
        .execute()
    }
  }
}
