# Use Node.js as the base image
FROM node:18

# Set the working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY frontend/package.json frontend/package-lock.json ./
RUN npm install

# Copy the entire frontend code
COPY frontend ./

# Expose frontend port
EXPOSE 3000

# Start the React app
CMD ["npm", "start"]
