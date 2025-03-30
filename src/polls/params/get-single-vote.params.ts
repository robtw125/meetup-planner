import { IsNotEmpty } from 'class-validator';

export class GetSingleVoteParams {
  @IsNotEmpty()
  pollId: string;

  @IsNotEmpty()
  voteId: string;
}
