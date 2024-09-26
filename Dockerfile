# Use an official Node.js 18 image as a base
FROM node:18-alpine

# Set the working directory in the container to /app
WORKDIR /app

# Copy package.json and package-lock.json into the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the code into the container
COPY . .

# Build the application
RUN npm run build

# Set the default command to start the application
CMD ["npm", "start"]