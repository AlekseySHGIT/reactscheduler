# Use Node.js base image
FROM node:18-alpine

# Install curl for healthcheck
RUN apk --no-cache add curl

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install all dependencies including lucide-react
RUN npm install lucide-react@latest
RUN npm install @vitejs/plugin-react vite
RUN npm install

# Copy all files
COPY . .

# Build the app
RUN npm run build

# Install serve to run the application
RUN npm install -g serve

# Expose port 3000
EXPOSE 3000

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

# Start the app
CMD ["serve", "-s", "dist", "-l", "3000"]