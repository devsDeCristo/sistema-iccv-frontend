# syntax=docker/dockerfile:1

# Node 24 (Krypton) = LTS atual. O engines do package.json exige >=22.12
# porque é o piso do Vite 7 — o yarn 1 aborta o install se a versão não bate
# (não é só warning). Mudou o ARG? confira o engines antes.
ARG NODE_VERSION=24.19.0

# -------------------------------------------------------------------- build
FROM node:${NODE_VERSION}-slim AS build
WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .

# O Vite substitui as VITE_* no bundle em BUILD TIME — passar em runtime não
# tem efeito. Por isso vem como ARG: cada ambiente gera sua própria imagem.
ARG VITE_API_URL
ARG VITE_MODULE_PAYMENT
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_MODULE_PAYMENT=$VITE_MODULE_PAYMENT
RUN yarn build

# ------------------------------------------------------------------ runtime
# Só o dist estático + nginx: a imagem final não carrega Node nem node_modules.
FROM nginx:1.29-alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
