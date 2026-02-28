FROM node:18-alpine

# Create app directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Create necessary directories
RUN mkdir -p uploads uploads/temp logs

# Copy app source
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /app/uploads /app/logs

USER nodejs

EXPOSE 5000

CMD ["npm", "start"]
