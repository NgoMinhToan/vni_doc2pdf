FROM debian:bookworm-slim

ENV DEBIAN_FRONTEND=noninteractive
ENV NODE_ENV=production

# =========================
# System dependencies
# =========================
RUN apt-get update && apt-get install -y --no-install-recommends \
    libreoffice-core \
    libreoffice-writer \
    libreoffice-common \
    fontconfig \
    fonts-dejavu-core \
    nodejs \
    npm \
    locales \
    && rm -rf /var/lib/apt/lists/*

# =========================
# Locale (tránh lỗi font/encoding)
# =========================
RUN sed -i '/en_US.UTF-8/s/^# //g' /etc/locale.gen && \
    locale-gen

ENV LANG=en_US.UTF-8
ENV LC_ALL=en_US.UTF-8

# =========================
# Fonts VN / legacy
# =========================
COPY fonts /usr/share/fonts/truetype/custom
RUN fc-cache -f -v

# =========================
# App
# =========================
WORKDIR /app

# Copy package.json để npm install
COPY backend/package.json ./backend/package.json
WORKDIR /app/backend
RUN npm install --omit=dev

# Copy source code ĐÚNG VỊ TRÍ
COPY backend/server.js ./server.js
COPY backend/convert.sh ./convert.sh

# Copy frontend
WORKDIR /app
COPY public ./public

# =========================
# Runtime
# =========================
WORKDIR /app/backend
EXPOSE 3000
CMD ["node", "server.js"]
