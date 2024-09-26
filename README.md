# RabbitMQ Monitor

RabbitMQ Monitor is a web application built with Next.js that allows to monitor messages from RabbitMQ queues. It provides a user-friendly interface to view messages from multiple queues and refresh the data as needed.

## Features

- Real-time monitoring of RabbitMQ queues
- Automatic refresh of messages every 5 minutes
- Manual refresh option
- Display of queue name, message content, and timestamp
- Responsive design using Tailwind CSS and shadcn/ui components
- Dockerized setup for easy deployment

## Technologies Used

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- shadcn/ui components
- amqplib for RabbitMQ connection
- Docker for RabbitMQ containerization

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18 or later)
- npm (v8 or later)
- Docker and Docker Compose

## Setup

1. Clone the repository:
   ```
   https://github.com/debrajhyper/RabbitMQ-Monitor.git
   cd rabbitmq-monitor
   ```

2. Create a `.env.local` file in the root directory with the following content:
   ```
   RABBITMQ_URL=amqp://debraj:debraj@localhost:5672
   QUEUE_NAMES=queue1,queue2,queue3
   MAX_MESSAGES_PER_QUEUE=20
   ```

3. Create a `rabbitmq.conf` file in the root directory with the following content:
   ```
   loopback_users = none
   listeners.tcp.default = 5672
   management.tcp.port = 15672

   default_vhost = /
   default_user = debraj
   default_pass = debraj

   default_permissions.configure = .*
   default_permissions.read = .*
   default_permissions.write = .*

   heartbeat = 60
   handshake_timeout = 30000
   ```

## Running the Application

1. Build and start the containers:
   ```
   docker-compose up --build
   ```

2. Once the containers are up and running, can access:
   - The RabbitMQ Monitor application at `http://localhost:3000`
   - The RabbitMQ Management Interface at `http://localhost:15672` (use credentials: debraj/debraj)

3. Open browser and navigate to `http://localhost:3000` to view the application.

## Development

For development purposes, you can run the Next.js application outside of Docker:

1. Install dependencies:
   ```
   npm install
   ```

2. Run the development server:
   ```
   npm run dev
   ```

Remember to update the `RABBITMQ_URL` in `.env.local` to `amqp://debraj:debraj@localhost:5672` when running the app outside of Docker.

## Docker Configuration

### Dockerfile

The `Dockerfile` for the Next.js application is as follows:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

CMD ["npm", "start"]
```

This Dockerfile:
1. Uses Node.js 18 Alpine as the base image
2. Sets the working directory to `/app`
3. Copies package.json and package-lock.json
4. Installs dependencies
5. Copies the rest of the application code
6. Builds the Next.js application
7. Sets the command to start the application

### docker-compose.yml

The `docker-compose.yml` file sets up both the RabbitMQ service and the Next.js application:

```yaml
version: '3.8'
services:
  rabbitmq:
    image: rabbitmq:4-management
    container_name: RabbitMQ
    ports:
      - 5672:5672 # AMQP protocol port
      - 15672:15672 # Management UI port
    volumes:
      - ./rabbitmq.conf:/etc/rabbitmq/rabbitmq.conf:ro
      - rabbitmq_data:/var/lib/rabbitmq
    environment:
      - RABBITMQ_CONFIG_FILE=/etc/rabbitmq/rabbitmq.conf

  app:
    build: .
    ports:
      - 3000:3000
    environment:
      - RABBITMQ_URL=amqp://debraj:debraj@rabbitmq:5672
    depends_on:
      - rabbitmq

volumes:
  rabbitmq_data:
```

This configuration:
1. Sets up a RabbitMQ service with the management plugin
2. Mounts the `rabbitmq.conf` file and creates a persistent volume for RabbitMQ data
3. Builds and runs the Next.js application
4. Ensures the app service depends on RabbitMQ being available
5. Exposes necessary ports for both services

## Usage

1. Access the RabbitMQ Monitor at `http://localhost:3000`
2. The interface will display messages from the configured queues
3. Messages are automatically refreshed every 5 minutes
4. Click the "Refresh Messages" button for an immediate update

## Interacting with RabbitMQ Management Interface

1. Open browser and go to `http://localhost:15672/`

2. Log in with the credentials that used in `rabbitmq.conf`:
   - Username: debraj
   - Password: debraj

3. To publish a test message:
   - Click on the "Queues" tab
   - Select one of the queues (e.g., queue1)
   - Scroll down to the "Publish message" section
   - Enter a message in the "Payload" field
   - Click "Publish message"

4. Return to the RabbitMQ Monitor application and click "Refresh Messages" to see the new message.

## Project Structure

```
rabbitmq-monitor
├── app
│   ├── api
│   │   └── messages
│   │       └── route.ts
│   ├── fonts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components
│   ├── ui
│   └── RabbitMQMonitor.tsx
├── lib
│   └── rabbitmq.ts
├── .env.local
├── docker-compose.yml
├── Dockerfile
├── rabbitmq.conf
└── ... (other configuration files)
```

## Development

- The main application logic is in `components/RabbitMQMonitor.tsx`
- RabbitMQ connection logic is in `lib/rabbitmq.ts`
- API route for fetching messages is in `app/api/messages/route.ts`

## Building for Production

To build the application for production, run:

```
npm run build
```

Then, to start the production server:

```
npm start
```

## Troubleshooting

- If you encounter connection issues, ensure both containers are running:
  ```
  docker-compose ps
  ```
- Check the logs of the containers for any error messages:
  ```
  docker-compose logs
  ```
- Ensure the RabbitMQ credentials in `.env.local` match those in `rabbitmq.conf`

## License

This project is licensed under the MIT License.