# Use Node.js as the base image
FROM node:18

# Set the working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY backend/package.json backend/package-lock.json ./
RUN npm install

# Copy the entire backend code
COPY backend ./

# Expose backend port
EXPOSE 5000

# Start the backend in development mode
CMD ["npm", "run", "dev"]
