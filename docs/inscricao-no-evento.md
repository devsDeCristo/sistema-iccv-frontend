# Inscrição no evento (`/eventos/:id/inscricao`)

Fluxo passo a passo para se inscrever num evento: escolher grupo, escolher o ingresso (regra de valor) de cada grupo, aceitar o termo do evento quando houver, tratar o caso de menor de idade, receber a oferta de produtos da loja e seguir para o pagamento (ou não, quando a igreja não recebe online).

## Passos

A régua no topo (`SubscribeStepper`) mostra "Grupos" → "Ingressos" → "Produtos" (só existe quando o evento tem produto à venda). O passo "Produtos" não é um `currentStep` do formulário: ele é a tela de oferta que substitui o formulário depois da inscrição confirmada.

1. **Grupos** (`FormSelectGroupRole`): de quais grupos a pessoa quer participar. Múltipla escolha.
2. **Ingressos** (`FormSelectRole`): dentro de cada grupo escolhido, qual regra de valor (ingresso) levar. Escolha única por grupo.
3. **Confirmar inscrição:** envia a inscrição ao servidor.

Arquivos: `src/pages/events/subscribe/index.tsx`, `src/features/admin/events/components/formSelectGroupRole.tsx`, `src/features/admin/events/components/formSelectRole.tsx`.

## Escolha de grupo

- Grupo **inativo** some da lista, a não ser que a pessoa já esteja inscrita ou na espera nele.
- Grupo **agendado** ou **encerrado** aparece mas trava a escolha, com a etiqueta "Abre …" ou "Inscrições encerradas".
- Grupo em que a pessoa já está inscrita (confirmada ou em espera) também trava, com a etiqueta correspondente ("Você já está inscrito" / "Na lista de espera").
- Grupo aberto e sem vaga mostra "Só lista de espera", mas continua escolhível.
- As regras completas de estado de grupo (`estadoDoGrupo`, prazo padrão pelo fim do evento) estão em `docs/inscricao-em-grupos.md`.

## Escolha de ingresso (regra de valor)

Para cada grupo escolhido no passo 1, a pessoa marca uma regra (`role`) — preço em destaque no canhoto do cartão, "Grátis" quando o valor é zero. É seleção única por grupo: marcar outra regra do mesmo grupo desmarca a anterior.

## Resumo lateral

`SubscribeSummary` acompanha a escolha em tempo real, no formulário dos dois primeiros passos: cada grupo escolhido aparece como linha, sem preço até a regra ser escolhida, e o total soma ingressos e produtos da sacola (quando a oferta de produtos já rodou). Some o pagamento é necessário mesmo com a igreja fora do módulo online — a pessoa precisa saber quanto vai levar; nesse caso o rodapé avisa que o valor é combinado com a organização, e não que "o pagamento acontece depois".

Arquivo: `src/features/events/components/subscribeSummary.tsx`.

## Termo do evento

Um evento pode ter `event.data.registrationTerm` (HTML). `temTermo` considera vazio um HTML sem texto real (`<p><br></p>` do editor) mesmo com imagem/vídeo embutido contando como termo.

- **Sem termo:** ao confirmar o passo 2, a inscrição é enviada direto.
- **Com termo:** a inscrição fica retida (`inscricaoAguardandoTermo`) e abre o diálogo `EventTermsDialog` com o texto inteiro. O aceite (`Li e aceito todos os termos`) só libera depois que a rolagem chega ao fim do termo; termo curto que não gera rolagem já nasce liberado. Cancelar fecha o diálogo sem nada ter sido enviado. Aceitar dispara a inscrição com `acceptedTerms: true`.

Arquivos: `src/features/admin/events/terms.ts`, `src/features/events/components/eventTermsDialog.tsx`.

## Menor de idade e termo do responsável

- **Quem é menor:** calculado no front — `calculateAge(nascimento, dataDeInício do evento) < 16`. É a data do evento que importa, não a data de hoje.
- **Aviso (`MinorTermNotice`):** aparece no passo 2, abaixo da escolha de ingresso, só para quem é menor. Dois passos numerados: baixar o modelo do termo (`event.data.minorTermUrl`, quando o evento anexou um) e enviar o termo assinado — pode ser feito ali mesmo (anexa um arquivo) ou depois, em Minhas Inscrições.
- **Bloqueio de avanço:** menor de 16 só avança do passo 2 com o checkbox "Li o aviso e vou entregar o termo assinado" marcado (`avisoMenorLido`). Este aceite é estado da tela, não campo do formulário — não trava quem não é menor.
- **Envio do termo assinado:** se a pessoa anexou o arquivo nesta tela, ele sobe (`usePostGuardianTerm`, `POST /events/:eventId/users/:userId/guardian-term`) logo depois da inscrição ser confirmada com sucesso. A inscrição em si não espera a aprovação do termo — ela fica pendente de aprovação da organização, com ou sem envio imediato do arquivo.
- **Status da aprovação:** acompanhado depois em Minhas Inscrições / ingresso (`minorApprovalStatus`, `signedTermUrl`, `minorApprovalRejectionReason`) — ver `docs/ingresso.md`.

Arquivos: `src/features/admin/events/components/minorTermNotice.tsx`, `src/features/admin/events/api/postGuardianTerm.tsx`.

## Envio da inscrição e resultado

Ao confirmar, `usePostRegisterUserInEvent` pode devolver, por `role`, `REGISTERED` ou `WAITLIST`:

- **Tudo em lista de espera:** avisa e volta para a página do evento, sem passar pela loja nem pelo pagamento.
- **Ao menos uma confirmada, sem produto à venda:** segue direto para a decisão de pagamento.
- **Ao menos uma confirmada, com produto à venda:** abre a oferta de produtos antes do pagamento.

## Oferta de produtos após a inscrição

Quando o evento tem produto disponível (`temDisponivel` em alguma variante), a tela troca o formulário pela vitrine `ProductOffer` assim que a inscrição confirma pelo menos um grupo. É o mesmo componente da loja avulsa (`docs/loja-do-evento.md`), com o eyebrow "Inscrição confirmada".

- **Confirmar com produtos:** `usePostBuyEventProducts` com `attachToRegistration: true` — a compra entra no mesmo pagamento da inscrição — e depois segue automaticamente para o checkout (`pagarAgora = true`).
- **Pular ("Não, obrigado"):** segue para a decisão de pagamento normal, sem produto nenhum.
- **Saída sem decidir:** sair da tela (navegação, fechar aba, recarregar) antes de confirmar ou pular abre `ExitProductOfferDialog`, avisando que a inscrição continua confirmada mas os produtos escolhidos ali não entram no pagamento — dá para comprá-los depois, como compra separada, pela página do evento.
- Estoque esgotado durante a escolha: o servidor recusa o item e a tela recarrega o evento para atualizar a disponibilidade, sem perder a inscrição.

Arquivos: `src/features/events/components/productOffer.tsx`, `src/features/events/components/exitProductOfferDialog.tsx`, `src/features/admin/events/api/postBuyEventProducts.tsx` (não lido em detalhe aqui — ver `docs/loja-do-evento.md`).

## Pagamento e checkout

- **Igreja que recebe pelo site** (`recebePagamentoOnline`, vindo de `event.church.chargesOnline` — módulo ligado **e** gateway ativo, com fallback para `modulePayment` em resposta antiga): depois de confirmar (com ou sem oferta de produtos), pergunta se a pessoa quer pagar agora. "Sim" abre `usePostCreateCheckoutEvent`, que cria a sala de pagamento e abre o link do gateway (`window.open`) em nova aba — checkout sempre hospedado, nunca transparente. "Não" volta para a página do evento; o pagamento fica pendente em Minhas Inscrições.
- **Alguma inscrição foi para lista de espera:** a pergunta de pagamento cobre só as confirmadas ("Deseja realizar o pagamento apenas das confirmadas?").
- **Igreja sem pagamento online** (`recebePagamentoOnline === false`): nenhuma pergunta de pagamento aparece. A inscrição é dada como concluída com aviso de que o valor é combinado diretamente com a organização.
- **Erro 503 do servidor ao criar o checkout** (`ehPagamentoForaDoSite`): tratado como o mesmo aviso acima, não como erro — a inscrição já está feita, só o pagamento pelo site não está disponível para aquela igreja.

Arquivo: `src/features/admin/events/api/postCreateCheckoutEvent.tsx`. Regras de gateway no servidor: repositório `ic-backend`, `docs/pagamentos.md`.
