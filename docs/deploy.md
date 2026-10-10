# Deploy

Push na `main` gera a imagem do front (o `dist` estático servido por nginx),
publica no GitHub Container Registry e troca a imagem do serviço
`sistema-eventos-iccv_web` no Docker Swarm. Tudo em
`.github/workflows/build-push.yml`. O deploy do backend está no repositório
`ic-backend`, em `docs/deploy.md`.

## Variáveis `VITE_*`

O Vite embute as `VITE_*` no bundle **durante o build**. Passar em runtime não
tem efeito, então cada ambiente gera sua própria imagem.

- **Automáticas:** não é preciso declarar variável no workflow nem no Dockerfile. Tudo cujo nome começa com `VITE_`, cadastrado em Settings > Secrets and variables > Actions, em **Variables** ou em **Secrets** (do repositório ou da organização), entra no próximo build. Se o mesmo nome existir nos dois, vale a Secret.
- **Secret não esconde nada aqui:** o valor vai para dentro do bundle, que qualquer pessoa baixa pelo navegador. Não há segredo possível no front: só entra `VITE_*` que pode ser pública (URL da API, site key do Turnstile, Client ID do Google).
- **Environments não entram:** o job não declara `environment:`, então variável cadastrada em Settings > Environments não chega ao build.
- **Como chegam:** o workflow junta as `VITE_*` num build-arg só, `VITE_BUILD_ENV`, com pares `CHAVE=valor` separados por `\x1f`. O `build-args` da action não aceita valor com quebra de linha, por isso esse separador.
- **No Dockerfile:** o pacote vira ambiente do `yarn build`, e não arquivo `.env`, para o valor chegar cru. Assim o Vite não expande `$` nem corta a partir de `#`.
- **Nome sem `VITE_`:** não entra, porque o Vite não expõe ao código variável sem esse prefixo.

Arquivos: `.github/workflows/build-push.yml` e `Dockerfile`.

## Build local

```
VITE_API_URL=http://localhost:5000 docker compose up --build
```

O `docker-compose.yml` passa o mesmo `VITE_BUILD_ENV`, com uma `VITE_*` por
linha e os valores padrão de desenvolvimento. Variável nova para o build local
entra como mais uma linha ali. Mudou algum valor? Precisa rebuildar, porque o
Vite embute o valor no bundle.

Arquivo: `docker-compose.yml`.
