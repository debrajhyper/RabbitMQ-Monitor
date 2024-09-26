import { NextResponse } from 'next/server';
import { fetchMessagesFromRabbitMQ } from '@/lib/rabbitmq';

// Cache for messages from RabbitMQ
let cachedMessages: unknown[] = [];
// Timestamp of when we last fetched messages from RabbitMQ
let lastFetchTime = 0;

/**
 * API route to fetch messages from RabbitMQ.
 * Will return cached messages if they are less than 5 minutes old,
 * or fetch fresh messages if they are older than 5 minutes,
 * or if the "forceRefresh" query parameter is set to "true".
 */
export async function GET(request: Request) {
    console.log('API route called to fetch messages from RabbitMQ');

    // Parse the URL to get query parameters
    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get('forceRefresh') === 'true';

    const currentTime = Date.now();
    if (forceRefresh || currentTime - lastFetchTime > 5 * 60 * 1000) {// 5 minutes or force refresh
        console.log('Fetching fresh messages from RabbitMQ');
        try {
            // Fetch messages from RabbitMQ
            cachedMessages = await fetchMessagesFromRabbitMQ();
            // Update the last fetch time
            lastFetchTime = currentTime;
            console.log('Successfully fetched messages:', cachedMessages);
        } catch (error) {
            console.error('Error fetching messages from RabbitMQ:', error);
            // Return an error if we failed to fetch messages
            return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
        }
    } else {
        console.log('Returning cached messages');
    }

    // Return the cached messages
    return NextResponse.json(cachedMessages);
}