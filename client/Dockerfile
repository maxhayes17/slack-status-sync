FROM node:20-alpine AS build
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy application files
COPY . . 

# Expose port
EXPOSE 3000

# Start app
CMD ["npm", "start"]