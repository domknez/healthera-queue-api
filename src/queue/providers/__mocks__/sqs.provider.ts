import { DEFAULT_POLLING_INTERVAL_IN_MS } from '../../../common/constants';

export const SQSProvider = jest.fn().mockReturnValue({
  publish: jest.fn().mockResolvedValue(undefined),
  subscribe: jest.fn().mockResolvedValue(undefined),
});

console.log('Polling Interval:', DEFAULT_POLLING_INTERVAL_IN_MS);
