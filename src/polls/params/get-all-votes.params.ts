import { IsNotEmpty } from 'class-validator';

export class GetAllVotesParams {
  @IsNotEmpty()
  pollId: string;
}
