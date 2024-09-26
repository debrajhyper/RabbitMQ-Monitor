'use client';

import React, { useState, useEffect } from 'react';
import { RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface QueueMessage {
    queueName: string;
    message: string;
    timestamp: string;
}

/**
 * The RabbitMQMonitor component displays a table of messages from RabbitMQ.
 * It fetches the messages from the /api/messages endpoint, and refreshes the
 * table every 5 minutes. The user can also manually refresh the table by
 * clicking the "Refresh Messages" button.
 *
 * The component also displays an error message if there is an error fetching
 * the messages, and a "No messages found" message if there are no messages.
 */
export const RabbitMQMonitor: React.FC = () => {
    /**
     * The state of the component, which includes the messages, the last updated
     * time, whether the component is loading, and any error messages.
     */
    const [messages, setMessages] = useState<QueueMessage[]>([]);
    const [lastUpdated, setLastUpdated] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Fetches the messages from the /api/messages endpoint, and updates the
     * state of the component.
     *
     * @param forceRefresh Whether to force a refresh of the messages, even if
     *                     they are less than 5 minutes old.
     */
    const fetchMessages = async (forceRefresh: boolean = false) => {
        // Set isLoading to true to show the loading indicator
        setIsLoading(true);
        // Clear any previous error messages
        setError(null);
        try {
            // Fetch the messages from the /api/messages endpoint
            const response = await fetch(`/api/messages${forceRefresh ? '?forceRefresh=true' : ''}`);
            if (!response.ok) {
                // Throw an error if the response is not OK
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            // Parse the response as JSON
            const data = await response.json();
            // Update the state with the new messages
            setMessages(data);
            // Update the last updated time
            setLastUpdated(new Date().toLocaleTimeString());
        } catch (e) {
            // Log any errors in the console
            console.error("Failed to fetch messages:", e);
            // Update the state with an error message
            setError("Failed to fetch messages. Check console for details.");
        } finally {
            // Set isLoading to false to hide the loading indicator
            setIsLoading(false);
        }
    };

    /**
     * A hook that fetches the messages when the component mounts, and sets up
     * an interval to fetch the messages every 5 minutes.
     */
    useEffect(() => {
        // Fetch the messages when the component mounts
        fetchMessages();

        // Set up an interval to fetch the messages every 5 minutes
        const interval = setInterval(fetchMessages, 5 * 60 * 1000);
        // Clear the interval when the component is unmounted
        return () => clearInterval(interval);
    }, []);

    /**
     * A function that is called when the user clicks the "Refresh Messages"
     * button. It forces a refresh of the messages by calling fetchMessages with
     * forceRefresh set to true.
     */
    const handleRefresh = () => {
        fetchMessages(true);
    };

    return (
        <Card className="w-full max-w-4xl mx-auto">
            <CardHeader>
                <CardTitle className="flex justify-between items-center">
                    {/* The title of the card, with a refresh button on the right */}
                    RabbitMQ Monitor Table
                    <Badge variant="outline" className="ml-2">
                        {/* A refresh icon and the last updated time */}
                        <RefreshCw className="mr-1 h-3 w-3" /> Last updated: {lastUpdated}
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                {/* A refresh button that fetches the messages when clicked */}
                <Button onClick={handleRefresh} disabled={isLoading} className='mb-2'>
                    {isLoading ? 'Refreshing...' : 'Refresh Messages'}
                </Button>
                {/* If there was an error fetching the messages, display an error message */}
                {error && <p className="text-red-500 my-2">{error}</p>}
                {/* The table of messages */}
                <Table>
                    <TableHeader>
                        <TableRow>
                            {/* The column headers */}
                            <TableHead>Queue Name</TableHead>
                            <TableHead>Message</TableHead>
                            <TableHead>Timestamp</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {/* If there are no messages, display a message saying so */}
                        {messages.length === 0
                            ? <TableRow><TableCell colSpan={3} className='text-center'>No messages found</TableCell></TableRow>
                            : messages.map((msg, index) => (
                                <TableRow key={index}>
                                    {/* The table rows, with the queue name, message, and timestamp */}
                                    <TableCell>{msg.queueName}</TableCell>
                                    <TableCell>{msg.message}</TableCell>
                                    <TableCell>{new Date(msg.timestamp).toLocaleString()}</TableCell>
                                </TableRow>
                            ))
                        }
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};