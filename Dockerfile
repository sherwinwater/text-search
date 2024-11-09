FROM node:20-alpine as build

ARG REACT_APP_SEARCH_ENGINE_API_URL
ARG NODE_ENV
ENV NODE_ENV=$NODE_ENV
ENV REACT_APP_SEARCH_ENGINE_API_URL=$REACT_APP_SEARCH_ENGINE_API_URL

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build



# Install serve and use it to host the app
RUN npm install -g serve
EXPOSE 3000
CMD ["serve", "-s", "build", "-l", "3000"]