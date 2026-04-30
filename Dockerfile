# Stage 1: Build frontend
FROM node:20-alpine AS frontend
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Build backend
FROM node:20-alpine AS backend
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci
COPY backend/ ./
RUN npm run build

# Stage 3: Production with nginx
FROM nginx:alpine
# Copy frontend build
COPY --from=frontend /app/frontend/dist /usr/share/nginx/html
# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Copy backend (we'll run it with node directly)
COPY --from=backend /app/backend/dist /app/backend
WORKDIR /app/backend

# Install production dependencies for running the backend
COPY --from=backend /app/backend/node_modules ./node_modules
COPY --from=backend /app/backend/package*.json ./

# Start both nginx and node in foreground
CMD sh -c "node src/main.js & nginx -g 'daemon off;'"
EXPOSE 80