FROM public.ecr.aws/docker/library/node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including dev deps for tsx)
RUN npm ci

# Copy source code
COPY src/ ./src/
COPY tsconfig.json ./

# Expose port
EXPOSE 8787

# Start the server with tsx (handles .ts imports natively)
CMD ["npm", "start"]
