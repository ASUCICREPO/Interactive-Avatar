# Use the official Node.js 20 image as a parent image
FROM node:20

# Set the working directory in the container to AvatarHost
WORKDIR /AvatarHost

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your application code
COPY src ./src
COPY webpack.config.js ./

# Expose port 8080 to the outside once the container starts
EXPOSE 8080

CMD ["npm", "run", "start"]
