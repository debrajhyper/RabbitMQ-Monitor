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

async function fetchMessagesFromRabbitMQ(): Promise<QueueMessage[]> {
    console.log('Attempting to fetch messages from RabbitMQ');
    console.log('RABBITMQ_URL:', RABBITMQ_URL);
    console.log('QUEUE_NAMES:', QUEUE_NAMES);
    console.log('MAX_MESSAGES_PER_QUEUE:', MAX_MESSAGES_PER_QUEUE);

    let connection: amqp.Connection | null = null;
    let channel: amqp.Channel | null = null;

    try {
        connection = await amqp.connect(RABBITMQ_URL, {
            heartbeat: 60,  // Increase heartbeat interval to 60 seconds
            timeout: 30000  // Set connection timeout to 30 seconds
        }); 
        console.log('Successfully connected to RabbitMQ');

        channel = await connection.createChannel();
        console.log('Successfully created a channel');

        const allMessages: QueueMessage[] = [];

        for (const queue of QUEUE_NAMES) {
            console.log(`Checking queue: ${queue}`);
            await channel.assertQueue(queue, { durable: false });
            const { messageCount } = await channel.checkQueue(queue);
            console.log(`Queue ${queue} has ${messageCount} messages`);

            const messagesToFetch = Math.min(messageCount, MAX_MESSAGES_PER_QUEUE);

            for (let i = 0; i < messagesToFetch; i++) {
                const message = await channel.get(queue, { noAck: true });
                if (message) {
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