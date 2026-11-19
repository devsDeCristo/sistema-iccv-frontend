# Oportunidades

Módulo do plano (`OPPORTUNITIES`) de classificados de emprego: o admin da
igreja publica vagas — na própria igreja ou na empresa de um membro —, os
membros demonstram interesse, e o admin vê quem se interessou e exporta a
lista para mandar a quem ofereceu a vaga. Regras e rotas da API em
`ic-backend/docs/oportunidades.md`.

## Tela do membro (`/oportunidades`)

- **Quem vê:** a barra lateral da área do participante mostra Oportunidades
  só a quem é membro de uma igreja com o módulo no plano
  (`memberChurch.modulos` da sessão). Quem abrir o endereço sem isso lê o
  motivo, e a tela nem consulta a API.
- **Aviso:** no topo, "Ao demonstrar interesse, a igreja repassa seu nome,
  celular e e-mail a quem oferece a vaga" — a pessoa sabe o que sai dela
  antes de clicar.
- **Lista:** as vagas abertas da igreja, as novas primeiro, em cards (três
  colunas na tela grande, duas no tablet, uma no celular): título, quem
  oferece, local, a descrição inteira (com as quebras de linha) e a data.
- **Interesse:** **Tenho interesse** (botão cheio) registra; depois o botão
  vira **Retirar interesse** (contorno, com ✓). Vaga encerrada some da tela.

## Painel (`/admin/oportunidades`)

- **Quem vê:** só o admin da igreja (e dev/super admin), com o módulo no
  plano — rota com `ADMIN_ROLES`; a tesouraria não tem o item no menu. O
  seletor de igreja do topo (`ChurchScopeBar` + `useIgrejaSelecionada`)
  escolhe de qual igreja são as vagas.
- **Abas** (`NavTabs`): **Abertas** e **Encerradas**, com a quantidade de
  cada uma. **Nova oportunidade** fica ao lado das abas.
- **Lista** (`components/listaDaIgreja.tsx`): a vaga (título, quem oferece e
  local), os interessados (botão com a contagem, que abre a lista), a data e
  a situação em chip (Aberta em verde, Encerrada em cinza). As ações ficam na
  própria linha: **Editar**, **Encerrar**/**Reabrir** (sem confirmação: é
  reversível) e **Excluir** (com confirmação; com interessados, o aviso
  sugere exportar antes).
- **Formulário** (`components/modalDaOportunidade.tsx`): Vaga*, Quem
  oferece*, Local e Descrição*. O asterisco vem do rótulo
  (`InputLabelProps.required`), não do `required` do campo.
- **Interessados** (`components/modalInteressados.tsx`): foto, nome, celular
  e e-mail de cada um, na ordem em que chegaram, com a data. **Exportar
  PDF** gera `<vaga>-interessados.pdf` para o admin mandar a quem ofereceu a
  vaga: no topo, o título da vaga e "Interessados na vaga · <quem oferece>";
  depois uma tabela só com **Nome, Celular e E-mail** (a data do interesse e
  a foto não vão); no rodapé, a quantidade e a paginação. Usa o mesmo
  `PdfUsersExport` da exportação de inscritos do evento
  (`features/admin/events/components/exportUsers`), sem logo, em retrato.
  Enquanto gera, o botão diz "Gerando…"; sem interessados, fica desligado.
- **Home do painel:** card de Oportunidades para o admin da igreja
  (`modulosDaIgreja.tsx`), como os outros módulos.

## Identidade

Ícone `Work` e a paleta "Mãos à obra" (Ne 2:18), laranja, em
`CORES_DO_MODULO`: claro `#8A3A00` / `#AD4A00` / `#D9650B`, escuro
`#F2B07C` / `#FF9B52` / `#EE7A22` (contrastes conferidos: primária 7,8:1 e
8,6:1 com o texto do botão; secundária 4,9:1 e 7:1; terciária 3,2:1 e
5,2:1). As duas telas abrem com `TemaDoModulo`.

Arquivos: `src/features/oportunidades/` (api, tipos, a lista do painel, o
formulário e a janela de interessados), `src/pages/admin/oportunidades/`,
`src/pages/oportunidades/`.
