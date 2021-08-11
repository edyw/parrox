FROM node:16-buster-slim
WORKDIR /app
COPY . /app
RUN npm ci
USER 0
ENTRYPOINT ["./scripts/docker-entrypoint.sh"]
