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
#
# Todas chegam num ARG só, e variável nova entra sem mexer aqui: pares
# CHAVE=valor, um por linha (docker compose) ou separados por \x1f (o workflow,
# porque o build-args da action não aceita quebra de linha). Viram ambiente do
# `yarn build`, e não arquivo .env, para o valor chegar cru — sem o Vite
# expandir `$` nem cortar em `#`.
ARG VITE_BUILD_ENV=""
RUN printf '%s\n' "$VITE_BUILD_ENV" | tr '\037\n' '\000\000' | grep -zv '^$' \
  | xargs -0 -x sh -c 'exec env "$@" yarn build' sh

# ------------------------------------------------------------------ runtime
# Só o dist estático + nginx: a imagem final não carrega Node nem node_modules.
FROM nginx:1.29-alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
