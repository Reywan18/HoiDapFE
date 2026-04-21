# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Tạo bản build production vào thư mục /app/dist
RUN npm run build

# Run stage
FROM nginx:alpine
# Xóa cấu hình mặc định của Nginx và thay bằng cấu hình custom (hoạt động với React Router)
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Copy file build từ bước trước sang Nginx
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
