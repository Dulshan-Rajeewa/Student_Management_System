# Use the lightweight version of Node.js 18
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of your backend code (including .env)
COPY . .

# Run the server
CMD ["node", "index.js"]