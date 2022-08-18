import { gyomu_market_holiday, PrismaClient } from '@prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';

import prisma from '../dbclient';

jest.mock('../dbclient', () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>(),
}));

export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

beforeEach(() => {
  //console.log('beforeEach in baseDBClass', prismaMock, prisma);
  mockReset(prismaMock);

  prismaMock.gyomu_market_holiday.findMany.mockResolvedValue(dummy_holidays);
});

const dummy_holidays: gyomu_market_holiday[] = [
  { year: 1984, market: 'JP', holiday: '19840101' },
  { year: 1984, market: 'JP', holiday: '19840102' },
  { year: 1984, market: 'JP', holiday: '19840115' },
  { year: 1984, market: 'JP', holiday: '19840116' },
  { year: 1984, market: 'JP', holiday: '19840211' },
  { year: 1984, market: 'JP', holiday: '19840320' },
  { year: 1984, market: 'JP', holiday: '19840429' },
  { year: 1984, market: 'JP', holiday: '19840430' },
  { year: 1984, market: 'JP', holiday: '19840503' },
  { year: 1984, market: 'JP', holiday: '19840505' },
  { year: 1984, market: 'JP', holiday: '19840915' },
  { year: 1984, market: 'JP', holiday: '19840923' },
  { year: 1984, market: 'JP', holiday: '19840924' },
  { year: 1984, market: 'JP', holiday: '19841010' },
  { year: 1984, market: 'JP', holiday: '19841103' },
  { year: 1984, market: 'JP', holiday: '19841123' },
];
