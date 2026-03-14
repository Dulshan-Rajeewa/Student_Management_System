# Use lightweight Node image
FROM node:18-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the React code
COPY . .

# Expose the React default port
EXPOSE 3000

# Start the React development server
CMD ["npm", "start"]