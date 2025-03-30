import { IsNotEmpty, IsArray, ArrayNotEmpty, IsNumber } from 'class-validator';

export class CreateVoteDto {
  @IsNotEmpty()
  participantName: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  timestamps: number[];
}
