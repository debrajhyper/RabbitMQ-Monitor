import * as amqp from 'amqplib';

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
const QUEUE_NAMES = (process.env.QUEUE_NAMES || 'queue1,queue2').split(',');
const MAX_MESSAGES_PER_QUEUE = parseInt(process.env.MAX_MESSAGES_PER_QUEUE || '10', 10);

// Define the QueueMessage interface
interface QueueMessage {
    queueName: string;
    message: string;
    timestamp: string;
}

/**
 * Connects to RabbitMQ and fetches messages from the specified queues.
 * @return {Promise<QueueMessage[]>} A promise that resolves to an array of
 *     QueueMessage objects.
 */
async function fetchMessagesFromRabbitMQ(): Promise<QueueMessage[]> {
    console.log('Attempting to fetch messages from RabbitMQ');

    /**
     * Define the connection and channel variables. These are used to
     * establish a connection to RabbitMQ and create a channel to interact
     * with the queues.
     */
    let connection: amqp.Connection | null = null;
    let channel: amqp.Channel | null = null;

    try {
        /**
         * Establish a connection to RabbitMQ. The connection URL is
         * configurable using the RABBITMQ_URL environment variable. The
         * default is 'amqp://localhost'.
         */
        connection = await amqp.connect(RABBITMQ_URL, {
            /**
             * Set the heartbeat interval to 60 seconds. This is the interval
             * at which the client will send a heartbeat message to the server
             * to keep the connection alive.
             */
            heartbeat: 60,
            /**
             * Set the connection timeout to 30 seconds. This is the amount of
             * time the client will wait for a response from the server before
             * closing the connection.
             */
            timeout: 30000
        });
        console.log('Successfully connected to RabbitMQ');

        /**
         * Create a channel to interact with the queues. The channel is used
         * to declare queues, bind queues to exchanges, and consume messages
         * from queues.
         */
        channel = await connection.createChannel();
        console.log('Successfully created a channel');

        /**
         * Initialize an empty array to store all the messages fetched from
         * the queues.
         */
        const allMessages: QueueMessage[] = [];

        /**
         * Loop through each queue specified in the QUEUE_NAMES environment
         * variable and fetch the messages.
         */
        for (const queue of QUEUE_NAMES) {
            console.log(`Checking queue: ${queue}`);

            /**
             * Assert the queue exists. If the queue does not exist, it will be
             * created. The queue is declared as non-durable, meaning it will
             * not persist across server restarts.
             */
            await channel.assertQueue(queue, { durable: false });

            /**
             * Get the number of messages in the queue.
             */
            const { messageCount } = await channel.checkQueue(queue);
            console.log(`Queue ${queue} has ${messageCount} messages`);

            /**
             * Determine the number of messages to fetch from the queue. This
             * is the minimum of the number of messages in the queue and the
             * MAX_MESSAGES_PER_QUEUE environment variable.
             */
            const messagesToFetch = Math.min(messageCount, MAX_MESSAGES_PER_QUEUE);

            /**
             * Loop through each message to be fetched and retrieve it from the
             * queue.
             */
            for (let i = 0; i < messagesToFetch; i++) {
                const message = await channel.get(queue, { noAck: true });
                if (message) {
                    /**
                     * Add the message to the array of all messages.
                     */
                    allMessages.push({
                        queueName: queue,
                        message: message.content.toString(),
                        timestamp: new Date().toISOString(),
                    });
                    console.log(`Fetched message from ${queue}: ${message.content.toString()}`);
                }
            }
        }

        console.log(`Total messages fetched: ${allMessages.length}`);
        return allMessages;
    } catch (error) {
        console.error('Error in fetchMessagesFromRabbitMQ:', error);
        throw error;
    } finally {
        /**
         * Close the channel and connection when done. This ensures that the
         * connection is properly closed and resources are released.
         */
        if (channel) {
            await channel.close();
            console.log('Channel closed');
        }
        if (connection) {
            await connection.close();
            console.log('Connection closed');
        }
    }
}

export { fetchMessagesFromRabbitMQ };