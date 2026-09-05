# CASTRO’S SERVICES — NEW CHAT CONTINUATION PROMPT

Use the following prompt verbatim when starting the next Castro’s Services chat.

```text
Vamos continuar o projeto CASTRO’S SERVICES diretamente no repositório oficial:

https://github.com/rightware-corporations/castro-service

ANTES DE QUALQUER ALTERAÇÃO:
1. Leia integralmente:
   docs/CASTROS-SERVICES-RECOVERY-HANDOFF-2026-09-05.md
2. Consulte também o handoff histórico/arquitetural:
   docs/CASTROS-SERVICES-MASTER-HANDOFF.md
3. Faça fetch live da main, PRs e CI. Não confie apenas em SHAs históricos.

O recovery handoff é a autoridade para o estado atual e contém também os erros que aconteceram no ciclo anterior e que NÃO devem ser repetidos.

ESTADO VERIFICADO NO MOMENTO DO HANDOFF:
- main: a8d43f10416ba34374c04fc7a162891f7b58638b
- último merge: PR #41 — fix: enforce canonical public design system
- último main CI verificado: Integration CI #270 / run 33917360933
- Backend quality gates: GREEN
- Frontend quality gates: GREEN
- PostgreSQL integration gates: GREEN

PRs #36, #37, #38, #39, #40 e #41 JÁ FORAM MERGED. NÃO reabra trabalho antigo por memória.

ERROS IMPORTANTES DO CICLO ANTERIOR — NÃO REPETIR:
1. Foi introduzido visual drift no website público ao trocar a composição editorial aprovada por um novo founder hero.
2. O design system ficou visualmente inconsistente; o utilizador identificou mudança de tipografia/ritmo.
3. O curso real de Oratória existia no backend, mas não aparecia no local mock preview, criando a impressão de que nada tinha sido implementado.
4. Houve demasiado tempo gasto em ciclos repetidos de CI/PostgreSQL sem comunicação concreta de progresso.
5. As instruções locais misturaram frontend, backend e Docker apesar de o utilizador querer apenas ver a UI.
6. O utilizador estava a visualizar a branch antiga `feature/training-system-completion` e não a main já reparada por PR #40/#41.

REGRA IMEDIATA:
A próxima revisão visual deve partir da CURRENT MAIN, não da branch antiga de training.

Se o repositório local estiver limpo, os comandos esperados são:

git status
git fetch origin
git switch main
git pull --ff-only origin main
git log -1 --oneline

Se houver ficheiros locais modificados, NÃO sobrescrever. Inspecione antes.

PARA PRIMEIRA REVISÃO VISUAL LOCAL:
Não exigir Docker/backend/PostgreSQL.
Use frontend mock mode:

cd frontend
$env:VITE_API_BASE_URL=""
$env:VITE_APP_SURFACE="ALL"
npm ci
npm run dev

Abrir:
http://localhost:5173

O frontend Vite usa 5173.
8080 é apenas o backend Spring Boot quando HTTP mode for intencionalmente ativado.

VERIFICAR PRIMEIRO, ANTES DE NOVO DESENVOLVIMENTO:
1. Homepage atual na main.
2. Tipografia/design system canónico.
3. `/formacao` deve mostrar o curso `Oratória e Comunicação Eficaz` em mock preview.
4. Abrir o card do curso.
5. Abrir detalhe do curso.
6. Clicar `Inscrever-me`.
7. Percorrer o fluxo de registration.
8. Confirmar founder hierarchy sem transformar Castro’s numa marca pessoal.
9. Confirmar consistência visual em Serviços, Formação, Espaços e Contacto.
10. Só depois criar uma lista objetiva do que ainda falta.

DESIGN SYSTEM — REGRA ABSOLUTA:
- Instrument Serif = headings/editorial moments.
- Manrope = body/UI/navigation/forms.
- CASTRO’S continua a master brand.
- Elizabeth Castro = Fundadora · Consultora · Formadora / trust anchor.
- Não redesenhar hero/páginas inteiras só para adicionar uma feature.
- Não introduzir outro sistema tipográfico.
- Evitar generic SaaS, card farms, glassmorphism gratuito, neon, gradientes arbitrários, AI-slop e métricas/testemunhos falsos.
- Não inventar biografia, factos, fotografias, métricas, capacidades, preços ou horários não confirmados.

FOTO DA ELIZABETH:
- não usar screenshot do Instagram como imagem final;
- não fabricar/sintetizar likeness;
- usar placeholder editorial até existir original aprovado;
- `VITE_ELIZABETH_PORTRAIT_URL` é o ponto de configuração.

ARQUITETURA DE UTILIZADORES — EXATAMENTE 4 EXPERIÊNCIAS:
1. Cliente — público, sem login interno.
2. Secretária / Operations — operação diária, `/app`.
3. CEO / Owner — Elizabeth, experiência executiva `/owner`, não CRUD diário.
4. RIGHTWARE Super Admin — identidade de plataforma separada / Control Plane.

NÃO EXISTE PERSONA “GESTOR”. Não criar quinta persona.

TRAINING SYSTEM:
- `/formacao` usa cards reutilizáveis data-driven.
- Cada novo curso muda dados, não formato/componente.
- Course admin já suporta nome, descrição curta, modalidade, duração, horários, investimento/moeda, certificado, learning outcomes, featured e session labels.
- telefone geral pertence à organização/PublicConfig, não ao curso.
- `COURSE_SESSION` NÃO é booking exclusivo.
- training usa `course_registrations` multi-participante.
- fluxo esperado:
  /formacao → card → detalhe → Inscrever-me → registration.
- pagamento ainda não foi adicionado; deve entrar depois da recolha de dados/registration sem redesenhar o sistema de cards.

SCHEDULING / CLINIC FLOW:
O Clinic Flow serviu apenas como referência de UX para:
- stepper/progress;
- persistent summary;
- date → real slot;
- review/confirmation;
- no-slot recovery;
- contextual fallback.

NÃO copiar fake/random frontend slots, semântica clínica, médicos, branding ou horários hardcoded.

SPACE e SERVICE agendável podem partilhar availability engine, mas:
- SPACE = reserva exclusiva de recurso.
- SERVICE = agendável apenas se configurado.
- COURSE_SESSION = registration multi-participante, não booking exclusivo.

CRM:
Visitor → Lead → Qualified Lead → Customer → Returning Customer.
- não criar ghost customers por browsing anónimo;
- preservar origem/contexto/CTA/UTM na conversão;
- requests têm responsável, follow-up, histórico/contexto;
- same-org isolation é obrigatório;
- Secretária opera follow-up;
- CEO recebe visão executiva.

TRUST / SECURITY:
- Public API, tenant/internal API e platform API são boundaries distintas.
- Frontend guard é UX; segurança real fica no backend/permissões/tenant isolation/DB constraints.
- Super Admin RIGHTWARE não é uma role Castro.
- Não reutilizar conta/password da CEO para plataforma.
- preservar CSRF/CORS/session separation e production-origin model.

GIT/CI — ABSOLUTO:
- nunca commit direto em main;
- branch curta por bloco;
- commits pequenos e rastreáveis;
- PR obrigatório;
- não squash/rebase/force-push;
- Backend + Frontend + PostgreSQL = 3/3 GREEN antes do merge;
- merge normal;
- verificar main pós-merge = 3/3 GREEN.

QUANDO CI FALHAR:
fetch exact run → exact failed job → exact logs/test report → proven root cause → minimal fix → rerun.
NÃO ficar horas a repetir hipótese genérica de “PostgreSQL connection”.

QUANDO EU DISSER `avança`, `continua`, `faça`, `implementa`, `corrige`:
EXECUTE usando estado live do GitHub. Não responda apenas com um plano já aprovado.

ORDEM DA PRÓXIMA SESSÃO:
A. Confirmar current main live.
B. Colocar o meu repo local na current main sem destruir mudanças locais.
C. Abrir frontend mock preview.
D. Auditar visualmente e funcionalmente o estado reparado.
E. Confirmar que o curso real aparece e o fluxo de inscrição funciona.
F. Comparar o que existe com o design/system requirements já documentados.
G. Produzir uma lista concreta de gaps restantes.
H. Só então implementar o próximo bloco em feature branch.
I. Depois P5 responsive/accessibility/visual QA.
J. Depois P6 production-like smoke/security/content validation.

A apresentação final continua a ser uma história conectada:
Cliente descobre → request/booking/registration → Secretária gere → CRM preserva contexto → CEO acompanha → RIGHTWARE opera a plataforma separadamente.

Comece agora lendo os dois handoffs, fazendo live audit da main e ajudando-me primeiro a verificar o estado visual REAL da current main. Não faça redesign nem reabra PRs antigos.
```
