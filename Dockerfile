# Build stage
FROM node:18-slim AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Production stage
FROM node:18-slim

# Create non-root user
RUN addgroup --system scraper && \
    adduser --system --group scraper

WORKDIR /app

# Copy from builder
COPY --from=builder /app/node_modules ./node_modules

# Copy source code
COPY . .

# Create and set permissions for output directory
RUN mkdir -p /app/output && \
    chown -R scraper:scraper /app

# Switch to non-root user
USER scraper

# Set environment variables
ENV NODE_ENV=production \
    NODE_OPTIONS="--max-old-space-size=2048"

# Volume for output
VOLUME ["/app/output"]

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node healthcheck.js

# Start the application
CMD ["npm", "start"]
