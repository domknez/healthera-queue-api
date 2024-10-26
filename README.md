# Queue Management API

This is a Nest.js API application for publishing and subscribing to messages on two types of queues: RabbitMQ and SQS.
The API is designed to work with either RabbitMQ or SQS based on environment configuration, following Twelve-Factor App principles.

## Table of Contents

1. [Setup and Running Instructions](#setup-and-running-instructions)
2. [Testing the API Manually](#testing-the-api-manually)
3. [Running Tests](#running-tests)
4. [Application Structure](#application-structure)
5. [Explanation of Queue Subscription](#explanation-of-queue-subscription)
6. [scripts/setup-queues.sh Explanation](#scriptssetup-queuessh-explanation)
7. [How to Use Both queues at Once](#how-to-use-both-queues-at-once)

---

### Setup and Running Instructions

1. **Clone the repository and navigate to the project directory**:

   ```bash
   git clone <repository-url>
   cd queue-app
   ```

2. **Create an environment configuration file `.env`**:

   - Copy the `.env.example` file to a file named `.env` and fill in the required data.
   - Default queue name is `healthera-queue`. If you want to use another one, either update the `scripts/setup-queues.sh` and replace `healthera-queue` with your custom queue name, or run this command in your terminal: `aws --endpoint-url=http://localstack:4566 --region us-east-1 sqs create-queue --queue-name <your-custom-queue-name>`
   - Set up environment variables for selecting either SQS or RabbitMQ:
     ```plaintext
     QUEUE_PROVIDER=SQS  # Set to RABBITMQ to use RabbitMQ
     SQS_QUEUE_URL=http://localstack:4566/000000000000/healthera-queue
     RABBITMQ_URL=amqp://rabbitmq:5672
     AWS_ACCESS_KEY_ID=test
     AWS_SECRET_ACCESS_KEY=test
     ```

3. **Start the application using Docker Compose**:

   - Run the following command to build and start the application along with RabbitMQ and Localstack for SQS emulation:

   ```bash
   docker-compose up --build
   ```

   - This command will also execute the queue setup script (`scripts/setup-queues.sh`), which initializes the SQS queue in Localstack.

4. **Access Logs for Real-Time Message Processing**:
   - Use the following command to view logs:
     ```bash
     docker-compose logs -f app
     ```

### Testing the API Manually

The following `curl` commands demonstrate manual testing of the API.

1. **Publish a Message to the Selected Queue**:

   ```bash
   curl -X POST http://localhost:3000/queue/publish -H "Content-Type: application/json" -d '{"message": "Hello dynamic queue!"}'
   ```

   - **Expected Output**: `{ "success": true }`
   - **Description**: Publishes the message "Hello dynamic queue!" to the queue selected based on `QUEUE_PROVIDER`.
   - **Expected Logs (RabbitMQ)**:
     ```plaintext
      app-1         | Subscribed to RabbitMQ queue and waiting for messages.
      app-1         | QueueController: Received request to publish message - Hello dynamic queue!
      app-1         | QueueService: Publishing message - Hello dynamic queue!
      app-1         | RabbitMQProvider: Publishing message to RabbitMQ queue - Hello dynamic queue!
      app-1         | RabbitMQProvider: Received message from RabbitMQ - Hello dynamic queue!
     ```
   - **Expected Logs (SQS)**:
     ```plaintext
      app-1         | SQSProvider: Polling SQS queue for messages.
      app-1         | QueueController: Received request to publish message - Hello dynamic queue!
      app-1         | QueueService: Publishing message - Hello dynamic queue!
      app-1         | SQSProvider: Publishing message to SQS queue - Hello dynamic queue!
      localstack-1  | 2024-10-26T15:12:03.042  INFO --- [et.reactor-0] localstack.request.aws     : AWS sqs.SendMessage => 200
      localstack-1  | 2024-10-26T15:12:03.042  INFO --- [et.reactor-1] localstack.request.aws     : AWS sqs.ReceiveMessage => 200
      app-1         | SQSProvider: Received message from SQS - Hello dynamic queue!
      localstack-1  | 2024-10-26T15:12:03.050  INFO --- [et.reactor-1] localstack.request.aws     : AWS sqs.DeleteMessage => 200
     ```

2. **Subscribe to Messages from the Selected Queue**:

   ```bash
   curl -X GET http://localhost:3000/queue/subscribe
   ```

   - **Expected Output**: `{ "success": true }`
   - **Description**: Starts a listener on the selected queue (either RabbitMQ or SQS based on `QUEUE_PROVIDER`).

### Running Tests

To run all tests, including unit and integration tests, use:

```bash
npm run test
```

This will run tests defined in the app code base, validating message publishing and subscription for both RabbitMQ and SQS.

### Application Structure

- **QueueController**: Handles incoming requests to publish and subscribe to messages on the queue provider selected by `QUEUE_PROVIDER`.
- **QueueService**: Manages queue publishing and subscription logic, interacting with the selected queue provider.
- **RabbitMQProvider**: Publishes and subscribes to RabbitMQ, setting up a listener for real-time message processing.
- **SQSProvider**: Publishes to SQS and uses a polling mechanism to periodically fetch messages from SQS.

### Explanation of Queue Subscription

- **Dynamic Module**: `QueueModule` dynamically selects either `RabbitMQProvider` or `SQSProvider` based on the `QUEUE_PROVIDER` environment variable. This allows seamless switching between RabbitMQ and SQS without code changes.
- **Queue Providers**:
  - **RabbitMQ**: A continuous listener consumes messages in real-time.
  - **SQS**: Due to SQS's polling nature, the application fetches messages at regular intervals using `setInterval`.

Only one queue provider is active at a time, and publishing/subscribing actions apply to the selected provider independently.

### scripts/setup-queues.sh Explanation

The `scripts/setup-queues.sh` script sets up the SQS queue in Localstack. This script runs automatically when starting the Docker environment to create a queue for testing.

```bash
#!/bin/bash
awslocal sqs create-queue --queue-name your-queue-name
```

- **awslocal**: Command-line tool provided by Localstack to interact with AWS services locally.
- **create-queue**: Creates an SQS queue with the specified name for testing.

### How to Use Both queues at Once

1. \*\*Modify `QueueModule` to Provide Both Providers

   In the current setup, `QueueModule` uses a dynamic module to provide only one queue provider at a time. To support both providers, we’ll register both `SQSProvider` and `RabbitMQProvider` in `QueueModule`:

   ```typescript
   @Module({})
   export class QueueModule {
     static forRoot(): DynamicModule {
       const providers = [];

       switch (process.env.QUEUE_PROVIDER) {
         case 'BOTH':
           providers.push(SQSProvider, RabbitMQProvider);
           break;
         case 'SQS':
           providers.push(SQSProvider);
           break;
         case 'RABBITMQ':
           providers.push(RabbitMQProvider);
           break;
         default:
           throw new Error(
             "Invalid QUEUE_PROVIDER. Set it to 'SQS', 'RABBITMQ', or 'BOTH'.",
           );
       }

       return {
         module: QueueModule,
         controllers: [QueueController],
         providers: [QueueService, ...providers],
         exports: [QueueService],
       };
     }
   }
   ```

2. Update `QueueService` to Handle Both Providers
   Update `QueueService` to inject and use both `SQSProvider` and `RabbitMQProvider`, enabling it to publish messages to and subscribe from both queues.

   ```typescript
   @Injectable()
   export class QueueService implements OnModuleInit {
     constructor(
       @Optional() private readonly sqsProvider?: SQSProvider,
       @Optional() private readonly rabbitMQProvider?: RabbitMQProvider,
     ) {}

     async onModuleInit() {
       console.log('QueueService: Initializing subscriptions...');
       if (this.sqsProvider) {
         await this.subscribeToSQS();
       }
       if (this.rabbitMQProvider) {
         await this.subscribeToRabbitMQ();
       }
     }

     async publishMessage(message: string): Promise<void> {
       console.log(`QueueService: Publishing message - ${message}`);
       if (this.rabbitMQProvider) {
         await this.rabbitMQProvider.publish(message);
       }
       if (this.sqsProvider) {
         await this.sqsProvider.publish(message);
       }
     }

     async subscribeToRabbitMQ(): Promise<void> {
       if (this.rabbitMQProvider) {
         console.log('QueueService: Subscribing to RabbitMQ...');
         await this.rabbitMQProvider.subscribe();
       }
     }

     async subscribeToSQS(): Promise<void> {
       if (this.sqsProvider) {
         console.log('QueueService: Subscribing to SQS...');
         await this.sqsProvider.subscribe();
       }
     }
   }
   ```

3. No changes are required in `QueueController`, as it will continue to route requests to `QueueService`. Now, whenever the `publishMessage` endpoint is called, it will send the message to both queues.

4. Make sure both RabbitMQ and SQS environment variables are defined in the `.env` file. You can add a new `QUEUE_PROVIDER=BOTH` to reflect this mode.

---

This README file provides step-by-step instructions for setup, testing, and a detailed description of expected logs and application structure.
