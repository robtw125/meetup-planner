import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreatePollDto } from './dto/create-poll.dto';
import { Poll } from '@prisma/client';
import type {
  PrismaClient,
  Prisma,
  Vote,
  Day,
  DaysOfVote,
} from '@prisma/client';
import { CreateVoteDto } from './dto/create-vote.dto';
import { DefaultArgs } from '@prisma/client/runtime/library';

type PrismaTransaction = Omit<
  PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
  '$on' | '$connect' | '$disconnect' | '$use' | '$transaction' | '$extends'
>;

interface FullDaysOfVote extends DaysOfVote {
  day: Day;
}

interface VoteIncludingDays extends Vote {
  daysOfVote: FullDaysOfVote[];
}

@Injectable()
export class PollsService {
  constructor(private prismaService: PrismaService) {}

  createPoll(createPollDto: CreatePollDto): Promise<Poll> {
    const { title, description } = createPollDto;

    return this.prismaService.poll.create({
      data: { title, description: description ?? '' },
    });
  }

  async findPoll(id: string, transaction?: PrismaTransaction): Promise<Poll> {
    const client = transaction ?? this.prismaService;

    const poll = await client.poll.findUnique({ where: { id } });

    if (!poll) throw new NotFoundException();
    return poll;
  }

  private fromTimestampsToDates(timestamps: number[]) {
    const dates: Date[] = [];

    for (const timestamp of timestamps) {
      const date = new Date(timestamp);
      dates.push(date);
    }

    return dates;
  }

  private getDateOfDay(date: Date): Date {
    const dayOfMonth = date.getDate();
    const monthIndex = date.getMonth();
    const year = date.getFullYear();

    return new Date(year, monthIndex, dayOfMonth);
  }

  private async getOrCreateDays(dates: Date[], transaction: PrismaTransaction) {
    const days: Day[] = [];

    for (const date of dates) {
      const dateOfDay = this.getDateOfDay(date);

      let day = await transaction.day.findUnique({
        where: { date: dateOfDay },
      });

      if (!day) {
        day = await transaction.day.create({ data: { date: dateOfDay } });
      }

      if (!days.some((d) => d.id === day.id)) days.push(day);
    }

    return days;
  }

  async createVote(
    pollId: string,
    createVoteDto: CreateVoteDto,
  ): Promise<Vote> {
    const { participantName, timestamps } = createVoteDto;

    return this.prismaService.$transaction(async (tx) => {
      //Ensures the proper error is thrown in case there is no poll with the given id
      await this.findPoll(pollId, tx);

      const dates = this.fromTimestampsToDates(timestamps);
      const days = await this.getOrCreateDays(dates, tx);

      return await tx.vote.create({
        data: {
          pollId,
          participantName,
          daysOfVote: {
            create: days.map((day) => ({ day: { connect: { id: day.id } } })),
          },
        },
      });
    });
  }

  private cleanVote(vote: VoteIncludingDays) {
    const { daysOfVote, ...rest } = vote;
    const cleanedVote = {
      ...rest,
      timestamps: daysOfVote.map((dayVote) => dayVote.day.date.getTime()),
    };

    return cleanedVote;
  }

  async getAllVotesOfPoll(pollId: string) {
    await this.findPoll(pollId);

    const votes = await this.prismaService.vote.findMany({
      where: { pollId },
      include: { daysOfVote: { include: { day: true } } },
    });

    if (!votes) return [];

    return votes.map((vote) => this.cleanVote(vote));
  }

  async getSingleVote(voteId: string) {
    const vote = await this.prismaService.vote.findUnique({
      where: { id: voteId },
      include: { daysOfVote: { include: { day: true } } },
    });

    if (!vote) throw new NotFoundException();

    return this.cleanVote(vote);
  }
}
