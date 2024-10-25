# Dockerfile
FROM node:18-alpine

# Install bash, curl, python3, and venv dependencies
RUN apk add --no-cache bash curl python3 py3-pip && \
    python3 -m venv /opt/venv && \
    /opt/venv/bin/pip install awscli

# Add AWS CLI to PATH
ENV PATH="/opt/venv/bin:$PATH"

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application
COPY . .

# Expose port and start the app
EXPOSE 3000
CMD ["npm", "run", "start"]
