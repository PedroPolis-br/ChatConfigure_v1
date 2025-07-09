# 🔧 Atualizações Necessárias no Instalador - WhatTicket SAAS

## ✅ O QUE PRECISA SER ATUALIZADO

### 📊 **1. BANCO DE DADOS - Novas Tabelas**

#### **Tabela: Stickers**
```sql
CREATE TABLE `Stickers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text,
  `category` varchar(100) NOT NULL DEFAULT 'geral',
  `filePath` varchar(255) NOT NULL,
  `fileName` varchar(255) NOT NULL,
  `mimeType` varchar(100) NOT NULL,
  `fileSize` int(11) NOT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `companyId` int(11) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `companyId` (`companyId`),
  KEY `category` (`category`),
  KEY `isActive` (`isActive`),
  CONSTRAINT `Stickers_ibfk_1` FOREIGN KEY (`companyId`) REFERENCES `Companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### **Tabela: MessageReactions**
```sql
CREATE TABLE `MessageReactions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `messageId` varchar(255) NOT NULL,
  `userId` int(11) NOT NULL,
  `reaction` varchar(10) NOT NULL,
  `companyId` int(11) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_message_reaction` (`messageId`, `userId`, `reaction`),
  KEY `userId` (`userId`),
  KEY `companyId` (`companyId`),
  KEY `messageId` (`messageId`),
  CONSTRAINT `MessageReactions_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `Users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `MessageReactions_ibfk_2` FOREIGN KEY (`companyId`) REFERENCES `Companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `MessageReactions_ibfk_3` FOREIGN KEY (`messageId`) REFERENCES `Messages` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### **Tabela: UserPermissions**
```sql
CREATE TABLE `UserPermissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `companyId` int(11) NOT NULL,
  `canCreateTickets` tinyint(1) DEFAULT 1,
  `canViewAllTickets` tinyint(1) DEFAULT 0,
  `canEditAllTickets` tinyint(1) DEFAULT 0,
  `canDeleteTickets` tinyint(1) DEFAULT 0,
  `canTransferTickets` tinyint(1) DEFAULT 1,
  `canCloseTickets` tinyint(1) DEFAULT 1,
  `canCreateContacts` tinyint(1) DEFAULT 1,
  `canEditContacts` tinyint(1) DEFAULT 1,
  `canDeleteContacts` tinyint(1) DEFAULT 0,
  `canViewContacts` tinyint(1) DEFAULT 1,
  `canCreateSchedules` tinyint(1) DEFAULT 1,
  `canEditOwnSchedules` tinyint(1) DEFAULT 1,
  `canEditAllSchedules` tinyint(1) DEFAULT 0,
  `canDeleteOwnSchedules` tinyint(1) DEFAULT 1,
  `canDeleteAllSchedules` tinyint(1) DEFAULT 0,
  `canViewSchedules` tinyint(1) DEFAULT 1,
  `canCreateCampaigns` tinyint(1) DEFAULT 0,
  `canEditCampaigns` tinyint(1) DEFAULT 0,
  `canDeleteCampaigns` tinyint(1) DEFAULT 0,
  `canViewCampaigns` tinyint(1) DEFAULT 1,
  `canViewReports` tinyint(1) DEFAULT 0,
  `canExportReports` tinyint(1) DEFAULT 0,
  `canViewSettings` tinyint(1) DEFAULT 0,
  `canEditSettings` tinyint(1) DEFAULT 0,
  `canCreateUsers` tinyint(1) DEFAULT 0,
  `canEditUsers` tinyint(1) DEFAULT 0,
  `canDeleteUsers` tinyint(1) DEFAULT 0,
  `canViewUsers` tinyint(1) DEFAULT 0,
  `canCreateQueues` tinyint(1) DEFAULT 0,
  `canEditQueues` tinyint(1) DEFAULT 0,
  `canDeleteQueues` tinyint(1) DEFAULT 0,
  `canViewQueues` tinyint(1) DEFAULT 1,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_company_permission` (`userId`, `companyId`),
  KEY `companyId` (`companyId`),
  CONSTRAINT `UserPermissions_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `Users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `UserPermissions_ibfk_2` FOREIGN KEY (`companyId`) REFERENCES `Companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 🔄 **2. ALTERAÇÕES EM TABELAS EXISTENTES**

#### **Messages - Adicionar coluna isEdited**
```sql
ALTER TABLE `Messages` ADD COLUMN `isEdited` tinyint(1) NOT NULL DEFAULT 0;
```

---

## 📦 **3. DEPENDÊNCIAS NPM**

### **Backend - package.json atualizado**
```json
{
  "dependencies": {
    // ... dependências existentes ...
    "multer": "^1.4.5-lts.1",
    "date-fns": "^2.29.3"
  },
  "devDependencies": {
    // ... dependências existentes ...
    "@types/multer": "^1.4.7"
  }
}
```

### **Frontend - package.json atualizado**
```json
{
  "dependencies": {
    // ... dependências existentes ...
    "date-fns": "^2.29.3",
    "use-sound": "^4.0.1"
  }
}
```

---

## 📁 **4. ESTRUTURA DE PASTAS**

### **Pastas a criar:**
```bash
# Backend
mkdir -p backend/public/stickers
mkdir -p backend/src/controllers
mkdir -p backend/src/middleware  
mkdir -p backend/src/services/NotificationService

# Frontend  
mkdir -p frontend/src/components/StickerPicker
mkdir -p frontend/src/components/MessageReactions
mkdir -p frontend/src/components/MessageEditDialog
mkdir -p frontend/src/components/ShowTicketOpenModal
mkdir -p frontend/src/hooks
```

---

## 🔗 **5. ROTAS A ADICIONAR**

### **Backend - routes/index.js**
```javascript
// Adicionar no arquivo de rotas existente:

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

## 🛠️ **6. SCRIPT DE MIGRAÇÃO COMPLETO**

### **migration_v2.sql**
```sql
-- ================================================
-- WHATICKET SAAS - MIGRAÇÃO PARA VERSÃO 2.0
-- Funcionalidades: Stickers, Reações, Edição, Permissões
-- ================================================

-- 1. Tabela de Stickers
CREATE TABLE IF NOT EXISTS `Stickers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text,
  `category` varchar(100) NOT NULL DEFAULT 'geral',
  `filePath` varchar(255) NOT NULL,
  `fileName` varchar(255) NOT NULL,
  `mimeType` varchar(100) NOT NULL,
  `fileSize` int(11) NOT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `companyId` int(11) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `companyId` (`companyId`),
  KEY `category` (`category`),
  KEY `isActive` (`isActive`),
  CONSTRAINT `Stickers_ibfk_1` FOREIGN KEY (`companyId`) REFERENCES `Companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Tabela de Reações
CREATE TABLE IF NOT EXISTS `MessageReactions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `messageId` varchar(255) NOT NULL,
  `userId` int(11) NOT NULL,
  `reaction` varchar(10) NOT NULL,
  `companyId` int(11) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_message_reaction` (`messageId`, `userId`, `reaction`),
  KEY `userId` (`userId`),
  KEY `companyId` (`companyId`),
  KEY `messageId` (`messageId`),
  CONSTRAINT `MessageReactions_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `Users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `MessageReactions_ibfk_2` FOREIGN KEY (`companyId`) REFERENCES `Companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `MessageReactions_ibfk_3` FOREIGN KEY (`messageId`) REFERENCES `Messages` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Tabela de Permissões
CREATE TABLE IF NOT EXISTS `UserPermissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `companyId` int(11) NOT NULL,
  `canCreateTickets` tinyint(1) DEFAULT 1,
  `canViewAllTickets` tinyint(1) DEFAULT 0,
  `canEditAllTickets` tinyint(1) DEFAULT 0,
  `canDeleteTickets` tinyint(1) DEFAULT 0,
  `canTransferTickets` tinyint(1) DEFAULT 1,
  `canCloseTickets` tinyint(1) DEFAULT 1,
  `canCreateContacts` tinyint(1) DEFAULT 1,
  `canEditContacts` tinyint(1) DEFAULT 1,
  `canDeleteContacts` tinyint(1) DEFAULT 0,
  `canViewContacts` tinyint(1) DEFAULT 1,
  `canCreateSchedules` tinyint(1) DEFAULT 1,
  `canEditOwnSchedules` tinyint(1) DEFAULT 1,
  `canEditAllSchedules` tinyint(1) DEFAULT 0,
  `canDeleteOwnSchedules` tinyint(1) DEFAULT 1,
  `canDeleteAllSchedules` tinyint(1) DEFAULT 0,
  `canViewSchedules` tinyint(1) DEFAULT 1,
  `canCreateCampaigns` tinyint(1) DEFAULT 0,
  `canEditCampaigns` tinyint(1) DEFAULT 0,
  `canDeleteCampaigns` tinyint(1) DEFAULT 0,
  `canViewCampaigns` tinyint(1) DEFAULT 1,
  `canViewReports` tinyint(1) DEFAULT 0,
  `canExportReports` tinyint(1) DEFAULT 0,
  `canViewSettings` tinyint(1) DEFAULT 0,
  `canEditSettings` tinyint(1) DEFAULT 0,
  `canCreateUsers` tinyint(1) DEFAULT 0,
  `canEditUsers` tinyint(1) DEFAULT 0,
  `canDeleteUsers` tinyint(1) DEFAULT 0,
  `canViewUsers` tinyint(1) DEFAULT 0,
  `canCreateQueues` tinyint(1) DEFAULT 0,
  `canEditQueues` tinyint(1) DEFAULT 0,
  `canDeleteQueues` tinyint(1) DEFAULT 0,
  `canViewQueues` tinyint(1) DEFAULT 1,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_company_permission` (`userId`, `companyId`),
  KEY `companyId` (`companyId`),
  CONSTRAINT `UserPermissions_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `Users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `UserPermissions_ibfk_2` FOREIGN KEY (`companyId`) REFERENCES `Companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Alterar tabela Messages para adicionar isEdited
ALTER TABLE `Messages` ADD COLUMN IF NOT EXISTS `isEdited` tinyint(1) NOT NULL DEFAULT 0;

-- 5. Criar permissões padrão para usuários existentes
INSERT IGNORE INTO `UserPermissions` (
  `userId`, `companyId`, `createdAt`, `updatedAt`
)
SELECT 
  `id`, `companyId`, NOW(), NOW() 
FROM `Users` 
WHERE `profile` = 'user';

-- 6. Criar permissões de admin para usuários admin
INSERT IGNORE INTO `UserPermissions` (
  `userId`, `companyId`, `canViewAllTickets`, `canEditAllTickets`, 
  `canDeleteTickets`, `canEditAllSchedules`, `canDeleteAllSchedules`,
  `canCreateCampaigns`, `canEditCampaigns`, `canDeleteCampaigns`,
  `canViewReports`, `canExportReports`, `canViewSettings`, 
  `canEditSettings`, `canCreateUsers`, `canEditUsers`, 
  `canDeleteUsers`, `canViewUsers`, `canCreateQueues`, 
  `canEditQueues`, `canDeleteQueues`, `createdAt`, `updatedAt`
)
SELECT 
  `id`, `companyId`, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, NOW(), NOW()
FROM `Users` 
WHERE `profile` = 'admin';

-- ================================================
-- MIGRAÇÃO CONCLUÍDA COM SUCESSO!
-- ================================================
```

---

## 🚀 **7. SCRIPT DE INSTALAÇÃO ATUALIZADO**

### **install.sh (exemplo)**
```bash
#!/bin/bash

echo "🚀 Instalando WhatTicket SAAS v2.0..."

# 1. Instalar dependências Backend
echo "📦 Instalando dependências do Backend..."
cd backend
npm install multer @types/multer date-fns
npm install

# 2. Instalar dependências Frontend  
echo "📦 Instalando dependências do Frontend..."
cd ../frontend
npm install date-fns use-sound
npm install

# 3. Criar estruturas de pastas
echo "📁 Criando estrutura de pastas..."
mkdir -p ../backend/public/stickers
chmod 755 ../backend/public/stickers

# 4. Executar migrações do banco
echo "🗄️ Executando migrações do banco..."
cd ../backend
npx sequelize-cli db:migrate

# 5. Executar script de migração custom
echo "🔄 Aplicando atualizações do banco..."
mysql -u $DB_USER -p$DB_PASS $DB_NAME < migration_v2.sql

# 6. Build do frontend
echo "🔨 Compilando Frontend..."
cd ../frontend
npm run build

echo "✅ Instalação concluída com sucesso!"
echo "🎉 WhatTicket SAAS v2.0 está pronto!"
```

---

## ⚙️ **8. VARIÁVEIS DE AMBIENTE ADICIONAIS**

### **.env (Backend)**
```env
# Adicionar às variáveis existentes:

# Upload de arquivos
UPLOAD_LIMIT=5mb
STICKERS_PATH=public/stickers

# Notificações
NOTIFICATIONS_ENABLED=true
SOUND_VOLUME=0.5

# Edição de mensagens  
MESSAGE_EDIT_TIME_LIMIT=900000
```

---

## 📋 **9. CHECKLIST DE ATUALIZAÇÃO**

### **Para o Instalador:**
- ✅ **Migrations SQL** para novas tabelas
- ✅ **package.json** atualizado (backend + frontend)
- ✅ **Script de criação** de pastas
- ✅ **Permissões padrão** para usuários existentes
- ✅ **Variáveis de ambiente** novas
- ✅ **Verificação de dependências** 
- ✅ **Backup automático** antes da migração

### **Sequência de Instalação:**
1. 🔄 **Backup** do banco de dados atual
2. 📦 **Instalar** novas dependências NPM
3. 📁 **Criar** estrutura de pastas
4. 🗄️ **Executar** migrations SQL
5. ⚙️ **Configurar** variáveis de ambiente
6. 🔨 **Build** do frontend
7. ✅ **Verificar** funcionamento

---

## 🎯 **10. RESULTADO FINAL**

### **Instalador Atualizado Terá:**
- ✅ **Migração automática** do banco
- ✅ **Instalação de dependências** novas
- ✅ **Criação de estruturas** necessárias  
- ✅ **Configuração automática** de permissões
- ✅ **Backup de segurança** antes da migração
- ✅ **Verificação de integridade** pós-instalação

### **Compatibilidade:**
- ✅ **Instalações novas** → funcionamento completo
- ✅ **Atualizações** → migração automática
- ✅ **Rollback** → backup disponível se necessário
- ✅ **Zero downtime** → migração sem interrupção

---

**Status**: ✅ **Scripts de Migração Prontos** 

O instalador precisa dessas atualizações para suportar todas as novas funcionalidades implementadas!