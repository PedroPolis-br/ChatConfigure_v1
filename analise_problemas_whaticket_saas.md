# Análise e Correções - WhatTicket SAAS

## Problemas Identificados e Soluções

### 1. Bug na Criação de Novos Tickets - Tela Cinza
**Problema**: Ao criar um novo ticket de um novo contato, a tela fica cinza e não manda mensagem.

**Causa Identificada**: 
- No arquivo `NewTicketModal/index.js`, há um componente `ShowTicketOpen` comentado que deveria exibir informações quando há erro na criação do ticket
- O tratamento de erro não está funcionando adequadamente

**Solução**:
1. Criar o componente `ShowTicketOpenModal` que está faltando
2. Melhorar o tratamento de erro no `CreateTicketService`
3. Adicionar loading states adequados
4. Implementar retry automático para criação de tickets

### 2. Notificações de Transferência de Tickets
**Problema**: Quando um usuário transfere direto para outro, não há notificação de som e aviso.

**Solução**:
1. Adicionar notificações sonoras no `UpdateTicketService` quando houver transferência
2. Implementar notificações visuais no frontend
3. Usar o `useSound` já existente no projeto para reproduzir som de notificação

### 3. Notificação para Clientes na Espera
**Problema**: Quando chega um cliente na espera, não há notificação.

**Solução**:
1. Adicionar evento socket quando ticket muda para status "pending"
2. Implementar notificação sonora e visual para status "pending"

### 4. Permissões de Agendamento de Mensagens
**Problema**: Atendente pode remover agendamento de mensagem de outro atendente.

**Solução**:
1. Modificar `ScheduleController` para verificar se o usuário é dono do agendamento
2. Adicionar validação no frontend para mostrar/ocultar botões baseado em permissões
3. Implementar verificação de propriedade no `DeleteService`

### 5. Sistema de Permissões Mais Granular
**Problema**: Só existe admin e user, falta granularidade nas permissões.

**Solução**:
1. Criar tabela `UserPermissions` para permissões específicas
2. Implementar middleware de autorização mais flexível
3. Criar interface de gerenciamento de permissões
4. Adicionar novos profiles: "supervisor", "agent", "viewer"

## Estrutura de Implementação

### Backend:
- `/models/UserPermission.ts` - Novo modelo para permissões
- `/middleware/checkPermission.ts` - Middleware para verificação
- `/services/NotificationService/` - Serviços de notificação
- Modificações em: `TicketController`, `ScheduleController`, `UpdateTicketService`

### Frontend:
- `/components/ShowTicketOpenModal/` - Modal para tickets já abertos
- `/components/PermissionManager/` - Gerenciador de permissões
- `/hooks/useNotifications.js` - Hook para notificações
- Modificações em: `NewTicketModal`, `ScheduleModal`, vários componentes

## Prioridade de Implementação:
1. Bug da tela cinza (crítico)
2. Permissões de agendamento (alta)
3. Notificações de transferência (alta)
4. Sistema de permissões granular (média)
5. Notificações de espera (média)