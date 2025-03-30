import { IsNotEmpty } from 'class-validator';

export class FindPollParams {
  @IsNotEmpty()
  pollId: string;
}
