import { IsNotEmpty } from 'class-validator';

export class CreateVoteParams {
  @IsNotEmpty()
  pollId: string;
}
