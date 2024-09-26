'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface QueueMessage {
    queueName: string;
    message: string;
    timestamp: string;
}

const RabbitMQMonitor: React.FC = () => {
    const [messages, setMessages] = useState<QueueMessage[]>([]);
    const [lastUpdated, setLastUpdated] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchMessages = async (forceRefresh: boolean = false) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/messages${forceRefresh ? '?forceRefresh=true' : ''}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setMessages(data);
            setLastUpdated(new Date().toLocaleTimeString());
        } catch (e) {
            console.error("Failed to fetch messages:", e);
            setError("Failed to fetch messages. Check console for details.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 5 * 60 * 1000); // 5 minutes
        return () => clearInterval(interval);
    }, []);

    const handleRefresh = () => {
        fetchMessages(true);
    };

    return (
        <Card className="w-full max-w-4xl mx-auto">
            <CardHeader>
                <CardTitle className="flex justify-between items-center">
                    RabbitMQ Monitor Table
                    <Badge variant="outline" className="ml-2">
                        <RefreshCw className="mr-1 h-3 w-3" /> Last updated: {lastUpdated}
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Button onClick={handleRefresh} disabled={isLoading} className='mb-2'>
                    {isLoading ? 'Refreshing...' : 'Refresh Messages'}
                </Button>
                {error && <p className="text-red-500 my-2">{error}</p>}
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Queue Name</TableHead>
                            <TableHead>Message</TableHead>
                            <TableHead>Timestamp</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {
                            messages.length === 0
                                ? <TableRow><TableCell colSpan={3} className='text-center'>No messages found</TableCell></TableRow>
                                : messages.map((msg, index) => (
                                    <TableRow key={index}>
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

export default RabbitMQMonitor;