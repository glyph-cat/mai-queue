import { StrictPropertyKey } from '@glyph-cat/swiss-army-knife'

export enum VoteType {
  WITHDRAW, // Could've been 'UNVOTE' but the spelling is too close to 'UPVOTE'
  UPVOTE,
  DOWNVOTE,
}

export type VoteCollection<Key extends StrictPropertyKey = string> = Record<Key, VoteType>
