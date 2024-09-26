import { NextResponse } from 'next/server';
import { fetchMessagesFromRabbitMQ } from '@/lib/rabbitmq';

let cachedMessages: unknown[] = [];
let lastFetchTime = 0;

export async function GET(request: Request) {
    console.log('API route called');

    // Parse the URL to get query parameters
    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get('forceRefresh') === 'true';

    const currentTime = Date.now();
    if (forceRefresh || currentTime - lastFetchTime > 5 * 60 * 1000) { // 5 minutes or force refresh
        console.log('Fetching fresh messages from RabbitMQ');
        try {
            cachedMessages = await fetchMessagesFromRabbitMQ();
            lastFetchTime = currentTime;
            console.log('Successfully fetched messages:', cachedMessages);
        } catch (error) {
            console.error('Error fetching messages from RabbitMQ:', error);
            return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
        }
    } else {
        console.log('Returning cached messages');
    }

    return NextResponse.json(cachedMessages);
}