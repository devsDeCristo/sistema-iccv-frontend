# syntax=docker/dockerfile:1

# Fixado em 18.x porque o package.json declara engines.node = "18.x" e o
# yarn 1 aborta o install quando a versão não bate (não é só warning).
# Para subir pra 20: atualize o engines primeiro, depois este ARG.
ARG NODE_VERSION=18.20.5

# -------------------------------------------------------------------- build
FROM node:${NODE_VERSION}-slim AS build
WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .

# O Vite substitui as VITE_* no bundle em BUILD TIME — passar em runtime não
# tem efeito. Por isso vem como ARG: cada ambiente gera sua própria imagem.
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN yarn build

# ------------------------------------------------------------------ runtime
# Só o dist estático + nginx: a imagem final não carrega Node nem node_modules.
FROM nginx:1.27-alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
