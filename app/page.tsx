import RabbitMQMonitor from '@/components/RabbitMQMonitor'

export default function Home() {
  return (
    <main className="container mx-auto py-10">
      <h1 className="text-4xl font-bold text-center mb-10">RabbitMQ Message Monitor</h1>
      <RabbitMQMonitor />
    </main>
  )
}