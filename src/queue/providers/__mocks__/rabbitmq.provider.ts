export const RabbitMQProvider = jest.fn().mockReturnValue({
  publish: jest.fn().mockResolvedValue(undefined),
  subscribe: jest.fn().mockResolvedValue(undefined),
});
