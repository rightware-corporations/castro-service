# CASTRO’S SERVICES — NEW CHAT CONTINUATION PROMPT

Use the following prompt verbatim when starting the next Castro’s Services chat.

> IMPORTANT: until PR #36 is merged, the master handoff is on branch `feature/public-intent-context`, not yet on `main`.

```text
Vamos continuar o projeto CASTRO’S SERVICES diretamente no repositório oficial:

https://github.com/rightware-corporations/castro-service

PRIMEIRO, antes de qualquer alteração, leia integralmente o handoff canónico nesta branch:

branch/ref: feature/public-intent-context
file: docs/CASTROS-SERVICES-MASTER-HANDOFF.md

Não procure esse ficheiro apenas na main enquanto o PR #36 ainda não tiver sido merged. Use explicitamente o ref `feature/public-intent-context`.

Esse handoff é a autoridade de continuidade do projeto. Não me peça para repetir o contexto já documentado nele.

ARQUITETURA DE UTILIZADORES — REGRA ABSOLUTA:
Existem exatamente 4 experiências/personas:
1. Cliente — público, sem login interno.
2. Secretária / Operations — utilizadora diária, experiência /app.
3. CEO / Owner — Elizabeth, experiência executiva /owner; não é operadora diária.
4. RIGHTWARE Super Admin — identidade de plataforma separada; futuro RIGHTWARE Control Plane.

NÃO EXISTE PERSONA “GESTOR”. Não invente, não reintroduza e não crie uma quinta persona.

A arquitetura de produção que devemos completar não é apenas o RIGHTWARE Control Plane. Ela inclui TODAS as superfícies:

A. PUBLIC WEB / CLIENTE
- domínio público Castro’s;
- homepage, serviços, formações, espaços, 360/configurador, contacto, pedidos, booking/registration;
- sem navegação interna exposta;
- sem login obrigatório para cliente público.

B. STAFF APP / SECRETÁRIA
- superfície autenticada própria, por exemplo app.castrosservices.<domain>;
- Secretária → /app;
- dashboard operacional, calendário, pedidos, reservas/agendamentos, leads/clientes/contactos, tarefas, notificações, relatórios operacionais, catálogo, disponibilidade, bloqueios, conteúdo/media;
- pode confirmar/cancelar/reagendar e bloquear horários ocupados por telefone/WhatsApp/offline;
- NÃO cria roles/permissões nem administra a plataforma.

C. STAFF APP / CEO/OWNER
- mesma superfície autenticada de staff, mas experiência Owner → /owner;
- dashboard executivo, agenda, atividade, leads/clientes, relatórios e sinais de atenção;
- UX para ver/entender/decidir, não para executar CRUD diário;
- não inventar KPIs/receita/métricas sem dados reais.

D. RIGHTWARE CONTROL PLANE / SUPER ADMIN
- superfície separada da Castro’s, alvo como ops.rightware.co.mz ou equivalente;
- identidade de plataforma separada dos tenant users;
- tenants/organizações, health, segurança, audit, suporte, plataforma;
- cada RIGHTWARE admin com identidade própria futuramente;
- não usar conta/password da CEO;
- não transformar Super Admin numa role Castro;
- preparar MFA/Zero Trust/support sessions auditáveis.

E. API / TRUST BOUNDARIES
- public API;
- authenticated tenant/internal API;
- platform API;
- segurança não depende de URLs escondidas;
- frontend guard é UX; backend + permissions + organization isolation + DB constraints são a segurança real;
- rever cookies Secure/HttpOnly/SameSite, CSRF/CORS, rate limiting/WAF, MFA readiness e no-public-employee-signup para a topologia real.

WORKFLOW GIT/GITHUB:
- main é protegida.
- Não commit direto em main.
- Commits pequenos e separados por preocupação.
- Não squash/rebase/force-push.
- PR obrigatório.
- Checks obrigatórios: Backend quality gates, Frontend quality gates, PostgreSQL integration gates.
- 3/3 verde antes de merge.
- Merge normal preservando commits.
- Validar CI pós-merge 3/3.
- Quando eu disser avança/continua/faça, execute no GitHub; não responda apenas com teoria.

PRIORIDADE IMEDIATA — PR #36:
O PR #36 chama-se `feat: connect scheduling, booking recovery, and training registrations`.
A baseline main antes dele era:
513c4828fe1dcd1fffa7a9e126c2163093b454db
com CI pós-merge #234 3/3 verde.

Antes do handoff, o PR #36 tinha Backend e Frontend verdes e PostgreSQL integration vermelho no CI #238. O commit do handoff e este prompt alteram novamente o HEAD da branch e iniciam CI novo, por isso NÃO confie no SHA/CI histórico.

FAÇA AGORA:
1. Fetch live do PR #36 e obtenha o HEAD atual.
2. Fetch dos workflow runs/jobs do HEAD atual.
3. Se o CI atual estiver em execução, acompanhe-o; se falhar, leia os logs do job vermelho.
4. Diagnostique especificamente o PostgreSQL integration gate com o erro real; não invente causa.
5. Corrija somente os erros comprovados, em commits separados.
6. Repita até Backend + Frontend + PostgreSQL = 3/3 verde no HEAD exato.
7. Faça merge NORMAL do PR #36 preservando todos os commits.
8. Obtenha o SHA da main depois do merge.
9. Valide o CI pós-merge até 3/3 verde.

REGRAS FUNCIONAIS IMPORTANTES JÁ DEFINIDAS:
- Um único scheduling engine real pode servir SPACE e SERVICE agendável, com semânticas diferentes.
- Espaço = reserva exclusiva de recurso.
- Consultoria/serviço = agendamento apenas se explicitamente configurado como schedulable.
- COURSE_SESSION NÃO usa booking exclusivo; usa course_registrations próprio e multi-participante.
- Formação sem sessão = receber próximas datas / interesse contextual.
- Formação corporativa = pedido contextual.
- Secretária pode bloquear períodos ocupados por outros canais.
- Backend é autoridade de slots; não aceitar horário manipulado fora do availability engine.
- double booking deve ser protegido server-side + PostgreSQL.
- no-slot deve oferecer próxima disponibilidade + pedir outro horário + telefone/WhatsApp contextual.
- Google Calendar é opcional V2, apenas sync/mirror. Castro DB continua source of truth.

INTENT / CRM:
- O sistema não deve pedir novamente algo que já sabe da jornada do utilizador.
- Preservar contexto de origem/entidade/CTA/UTM quando houver conversão real.
- Não criar ghost customers a partir de visitante anónimo.
- Direção de lifecycle: Visitor → Lead → Qualified Lead → Customer → Returning Customer.
- Pedidos devem evoluir para inbox comercial/operacional com contexto, interesse, responsável, follow-up e histórico.

DEPOIS DE FECHAR PR #36, siga a ordem do handoff:
A) Production Access & Trust Architecture COMPLETA para Cliente + Secretária + CEO + Super Admin + API boundaries;
B) CRM/lifecycle/Requests/follow-up;
C) media/conteúdo aprovado;
D) P5 responsive/accessibility/visual QA nas quatro experiências;
E) P6 production-like smoke/security/content validation;
F) apresentação final.

DESIGN:
- Instrument Serif headings; Manrope body/UI.
- profissional, institucional, editorial, premium e funcional.
- evitar generic SaaS/card farms, glassmorphism gratuito, neon, gradientes arbitrários, AI slop, fake metrics/testimonials.
- usar apenas factos/media reais aprovados pela Castro.

A apresentação final deve contar uma história conectada:
Cliente → pedido/agendamento/reserva/inscrição → Secretária gere → CEO acompanha → RIGHTWARE opera a plataforma.

Comece agora pelo live audit do PR #36 e execute de verdade até fechar o blocker e o merge, reportando branch, commits, CI, merge SHA e CI pós-merge.
```
