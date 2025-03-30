import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreatePollDto } from './dto/create-poll.dto';
import { PollsService } from './polls.service';
import { FindPollParams } from './params/find-poll.params';
import { CreateVoteParams } from './params/create-vote.params';
import { CreateVoteDto } from './dto/create-vote.dto';

@Controller('polls')
export class PollsController {
  constructor(private pollService: PollsService) {}

  @Post()
  createPoll(@Body() createPollDto: CreatePollDto) {
    return this.pollService.createPoll(createPollDto);
  }

  @Get(':pollId')
  async findPoll(@Param() findPollParams: FindPollParams) {
    return this.pollService.findPoll(findPollParams.pollId);
  }

  @Post(':pollId/votes')
  async createVote(
    @Param() createVoteParams: CreateVoteParams,
    @Body() createVoteDto: CreateVoteDto,
  ) {
    return this.pollService.createVote(createVoteParams.pollId, createVoteDto);
  }

  @Get(':pollId/votes')
  async findAllVotesOfPoll() {}

  @Get(':pollId/votes/:voteId')
  async findSingleVoteOfPoll() {}
}
