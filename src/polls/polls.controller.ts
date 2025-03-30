import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreatePollDto } from './dto/create-poll.dto';
import { PollsService } from './polls.service';
import { FindPollParams } from './params/find-poll.params';
import { CreateVoteParams } from './params/create-vote.params';
import { CreateVoteDto } from './dto/create-vote.dto';
import { GetAllVotesParams } from './params/get-all-votes.params';
import { GetSingleVoteParams } from './params/get-single-vote.params';

@Controller('polls')
export class PollsController {
  constructor(private pollService: PollsService) {}

  @Post()
  createPoll(@Body() createPollDto: CreatePollDto) {
    return this.pollService.createPoll(createPollDto);
  }

  @Get(':pollId')
  findPoll(@Param() findPollParams: FindPollParams) {
    return this.pollService.findPoll(findPollParams.pollId);
  }

  @Post(':pollId/votes')
  createVote(
    @Param() createVoteParams: CreateVoteParams,
    @Body() createVoteDto: CreateVoteDto,
  ) {
    return this.pollService.createVote(createVoteParams.pollId, createVoteDto);
  }

  @Get(':pollId/votes')
  findAllVotesOfPoll(@Param() getAllVotesParams: GetAllVotesParams) {
    return this.pollService.getAllVotesOfPoll(getAllVotesParams.pollId);
  }

  @Get(':pollId/votes/:voteId')
  findSingleVoteOfPoll(@Param() getSingleVoteParams: GetSingleVoteParams) {
    return this.pollService.getSingleVote(getSingleVoteParams.voteId);
  }
}
