import { RabbitMQMonitor } from '@/components/RabbitMQMonitor'

// The main page of the app
// It renders the RabbitMQ monitor component
export default function Home() {
  return (
    <main className="container mx-auto py-10">
      {/* The page title */}
      <h1 className="text-4xl font-bold text-center mb-10">
        RabbitMQ Message Monitor
      </h1>
      {/* The RabbitMQ monitor component */}
      <RabbitMQMonitor />
    </main>
  )
}