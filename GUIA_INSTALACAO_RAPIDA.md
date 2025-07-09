# 🚀 GUIA DE INSTALAÇÃO RÁPIDA - WhatTicket SAAS v2.0

## ⚡ INSTALAÇÃO AUTOMÁTICA (RECOMENDADO)

### **1. Download dos Arquivos**
```bash
# Baixe todos os arquivos necessários:
- migration_update_v2.sql       # Script SQL de migração
- update_whaticket_v2.sh        # Script de instalação
- Todos os arquivos de código criados
```

### **2. Executar Script Automático**
```bash
# Dar permissão de execução
chmod +x update_whaticket_v2.sh

# Executar atualização
./update_whaticket_v2.sh
```

O script irá:
- ✅ Fazer backup automático do banco
- ✅ Instalar dependências NPM
- ✅ Criar estrutura de pastas
- ✅ Executar migração SQL
- ✅ Configurar variáveis de ambiente
- ✅ Compilar frontend
- ✅ Reiniciar serviços

---

## 🔧 INSTALAÇÃO MANUAL (ALTERNATIVA)

### **1. Backup do Banco de Dados**
```bash
mysqldump -u usuario -p banco_whaticket > backup_$(date +%Y%m%d).sql
```

### **2. Instalar Dependências**
```bash
# Backend
cd backend
npm install multer @types/multer date-fns
npm install

# Frontend  
cd ../frontend
npm install date-fns use-sound
npm install
```

### **3. Criar Estrutura de Pastas**
```bash
mkdir -p backend/public/stickers
mkdir -p backend/src/middleware
mkdir -p backend/src/services/NotificationService
mkdir -p frontend/src/components/{StickerPicker,MessageReactions,MessageEditDialog,ShowTicketOpenModal}
mkdir -p frontend/src/hooks
```

### **4. Executar Migração SQL**
```bash
mysql -u usuario -p banco_whaticket < migration_update_v2.sql
```

### **5. Copiar Arquivos Novos**

#### **Backend:**
```
src/controllers/StickerController.ts
src/middleware/checkPermission.ts  
src/models/MessageReaction.ts
src/models/Sticker.ts
src/models/UserPermission.ts
src/services/NotificationService/CreateNotificationService.ts
src/services/WbotServices/EditWhatsAppMessage.ts
```

#### **Frontend:**
```
src/components/MessageEditDialog/index.js
src/components/MessageReactions/index.js
src/components/ShowTicketOpenModal/index.js
src/components/StickerPicker/index.js
src/hooks/useNotifications.js
```

### **6. Modificar Arquivos Existentes**

#### **Backend:**
- `src/controllers/ScheduleController.ts` → Adicionar verificação de permissões
- `src/services/TicketServices/CreateTicketService.ts` → Melhorar tratamento de erro
- `src/services/TicketServices/UpdateTicketService.ts` → Adicionar notificações

#### **Frontend:**
- `src/components/NewTicketModal/index.js` → Habilitar ShowTicketOpen
- `src/translate/languages/pt.js` → Adicionar traduções

### **7. Configurar Variáveis (.env)**
```env
# Adicionar no backend/.env
UPLOAD_LIMIT=5mb
STICKERS_PATH=public/stickers
NOTIFICATIONS_ENABLED=true
MESSAGE_EDIT_TIME_LIMIT=900000
```

### **8. Compilar e Reiniciar**
```bash
# Compilar frontend
cd frontend
npm run build

# Reiniciar backend
cd ../backend
pm2 restart all
# ou
npm start
```

---

## 🔗 ROTAS A ADICIONAR

### **No arquivo de rotas do backend:**
```javascript
import StickerController from "../controllers/StickerController";

// Stickers
app.get("/stickers", StickerController.index);
app.get("/stickers/categories", StickerController.getCategories);
app.post("/stickers", upload.single("file"), StickerController.store);
app.put("/stickers/:stickerId", StickerController.update);
app.delete("/stickers/:stickerId", StickerController.remove);

// Message Reactions  
app.get("/messages/:messageId/reactions", MessageReactionController.index);
app.post("/messages/:messageId/reactions", MessageReactionController.store);
app.delete("/messages/:messageId/reactions/:reactionId", MessageReactionController.remove);

// Message Edit
app.put("/messages/:messageId/edit", MessageController.edit);
```

---

## 🧪 TESTE DAS FUNCIONALIDADES

### **1. Bug da Tela Cinza**
- ✅ Tente criar ticket para contato existente
- ✅ Deve aparecer modal informativo

### **2. Edição de Mensagens**
- ✅ Envie mensagem como atendente
- ✅ Clique direito → "Editar" (até 15 min)
- ✅ Modal deve abrir com contador

### **3. Stickers**
- ✅ Admin: configurações → upload de stickers
- ✅ Chat: clique no ícone de sticker
- ✅ Deve aparecer categorias

### **4. Reações**
- ✅ Hover em mensagem → botão de reação
- ✅ Clique → seletor de emoji
- ✅ Reação aparece na mensagem

### **5. Notificações**
- ✅ Transfira ticket → deve tocar som
- ✅ Coloque em pending → deve notificar

### **6. Permissões**
- ✅ Usuário comum não deleta agendamento de outro
- ✅ Admin tem todas as permissões

---

## 🚨 SOLUÇÃO DE PROBLEMAS

### **Erro: Tabelas não criadas**
```bash
# Verificar se MySQL está rodando
sudo systemctl status mysql

# Executar migração manualmente
mysql -u root -p banco_whaticket < migration_update_v2.sql
```

### **Erro: Dependências não instaladas**
```bash
# Limpar cache do npm
npm cache clean --force

# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install
```

### **Erro: Frontend não compila**
```bash
# Verificar se todas as dependências estão instaladas
cd frontend
npm install date-fns use-sound
npm run build
```

### **Erro: Backend não inicia**
```bash
# Verificar logs
pm2 logs

# Verificar .env
cat backend/.env

# Reiniciar com logs
cd backend
npm start
```

### **Stickers não aparecem**
```bash
# Verificar permissões da pasta
chmod 755 backend/public/stickers

# Verificar se tabela foi criada
mysql -u root -p -e "USE banco_whaticket; SHOW TABLES LIKE 'Stickers';"
```

---

## 📋 CHECKLIST FINAL

### **Antes de Finalizar:**
- [ ] ✅ Backup do banco criado
- [ ] ✅ Dependências instaladas (backend + frontend)
- [ ] ✅ Migração SQL executada sem erros
- [ ] ✅ Arquivos novos copiados
- [ ] ✅ Arquivos existentes modificados
- [ ] ✅ Variáveis de ambiente configuradas
- [ ] ✅ Estrutura de pastas criada
- [ ] ✅ Frontend compilado sem erros
- [ ] ✅ Backend reiniciado
- [ ] ✅ Todas as funcionalidades testadas

### **Após Instalação:**
- [ ] ✅ Sistema funcionando normalmente
- [ ] ✅ Logs sem erros críticos
- [ ] ✅ Usuários conseguem acessar
- [ ] ✅ Notificações funcionando
- [ ] ✅ Stickers carregando
- [ ] ✅ Reações funcionando
- [ ] ✅ Edição de mensagens ativa

---

## 🎯 RESULTADO ESPERADO

### **Funcionalidades Ativas:**
✅ **Edição de mensagens** (15 min limit)  
✅ **Sistema de stickers** completo  
✅ **Reações às mensagens** (6 emojis)  
✅ **Notificações sonoras** de transferência  
✅ **Permissões granulares** de usuários  
✅ **Bug da tela cinza** resolvido  

### **Interface Melhorada:**
✅ **WhatsApp-like** experience  
✅ **Notificações visuais** e sonoras  
✅ **Controles avançados** de permissão  
✅ **Funcionalidades profissionais** para atendimento  

---

## 📞 SUPORTE

### **Em caso de problemas:**
1. 🔍 **Verificar logs** do backend e frontend
2. 📊 **Conferir migração** do banco de dados  
3. 🔧 **Validar dependências** instaladas
4. 📁 **Checar permissões** de arquivos
5. 🔄 **Reiniciar serviços** completamente

### **Rollback se necessário:**
```bash
# Restaurar backup do banco
mysql -u usuario -p banco_whaticket < backup_YYYYMMDD.sql

# Reverter código para versão anterior
git checkout HEAD~1  # se usando git
```

---

**Status**: ✅ **PRONTO PARA INSTALAÇÃO** 🚀

*Todas as funcionalidades foram testadas e estão prontas para produção!*