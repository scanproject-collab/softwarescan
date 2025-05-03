FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install

# Copy the rest of the application
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Create a startup script that transpiles TypeScript to JavaScript
RUN echo '#!/bin/sh' > /app/startup.sh && \
    echo 'echo "Running database migrations..."' >> /app/startup.sh && \
    echo 'npx prisma db push' >> /app/startup.sh && \
    echo 'echo "Creating admin user if needed..."' >> /app/startup.sh && \
    echo 'node scripts/create-admin-user.js' >> /app/startup.sh && \
    echo 'echo "Starting application..."' >> /app/startup.sh && \
    echo 'npx tsc-watch --onSuccess "node api/app.js"' >> /app/startup.sh && \
    chmod +x /app/startup.sh

# Expose the port your app runs on
EXPOSE 3000

# Start the application using the startup script
CMD ["/app/startup.sh"] 