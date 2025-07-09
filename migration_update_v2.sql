-- ================================================
-- WHATICKET SAAS - MIGRAÇÃO PARA VERSÃO 2.0
-- FUNCIONALIDADES: Stickers, Reações, Edição, Permissões
-- ================================================

SET FOREIGN_KEY_CHECKS = 0;

-- ================================================
-- 1. CRIAR TABELA DE STICKERS
-- ================================================
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
  KEY `idx_stickers_company` (`companyId`),
  KEY `idx_stickers_category` (`category`),
  KEY `idx_stickers_active` (`isActive`),
  CONSTRAINT `fk_stickers_company` FOREIGN KEY (`companyId`) REFERENCES `Companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- 2. CRIAR TABELA DE REAÇÕES DE MENSAGENS
-- ================================================
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
  KEY `idx_reactions_user` (`userId`),
  KEY `idx_reactions_company` (`companyId`),
  KEY `idx_reactions_message` (`messageId`),
  CONSTRAINT `fk_reactions_user` FOREIGN KEY (`userId`) REFERENCES `Users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_reactions_company` FOREIGN KEY (`companyId`) REFERENCES `Companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_reactions_message` FOREIGN KEY (`messageId`) REFERENCES `Messages` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- 3. CRIAR TABELA DE PERMISSÕES GRANULARES
-- ================================================
CREATE TABLE IF NOT EXISTS `UserPermissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `companyId` int(11) NOT NULL,
  
  -- Permissões de Tickets
  `canCreateTickets` tinyint(1) DEFAULT 1,
  `canViewAllTickets` tinyint(1) DEFAULT 0,
  `canEditAllTickets` tinyint(1) DEFAULT 0,
  `canDeleteTickets` tinyint(1) DEFAULT 0,
  `canTransferTickets` tinyint(1) DEFAULT 1,
  `canCloseTickets` tinyint(1) DEFAULT 1,
  
  -- Permissões de Contatos
  `canCreateContacts` tinyint(1) DEFAULT 1,
  `canEditContacts` tinyint(1) DEFAULT 1,
  `canDeleteContacts` tinyint(1) DEFAULT 0,
  `canViewContacts` tinyint(1) DEFAULT 1,
  
  -- Permissões de Agendamentos
  `canCreateSchedules` tinyint(1) DEFAULT 1,
  `canEditOwnSchedules` tinyint(1) DEFAULT 1,
  `canEditAllSchedules` tinyint(1) DEFAULT 0,
  `canDeleteOwnSchedules` tinyint(1) DEFAULT 1,
  `canDeleteAllSchedules` tinyint(1) DEFAULT 0,
  `canViewSchedules` tinyint(1) DEFAULT 1,
  
  -- Permissões de Campanhas
  `canCreateCampaigns` tinyint(1) DEFAULT 0,
  `canEditCampaigns` tinyint(1) DEFAULT 0,
  `canDeleteCampaigns` tinyint(1) DEFAULT 0,
  `canViewCampaigns` tinyint(1) DEFAULT 1,
  
  -- Permissões de Relatórios
  `canViewReports` tinyint(1) DEFAULT 0,
  `canExportReports` tinyint(1) DEFAULT 0,
  
  -- Permissões de Configurações
  `canViewSettings` tinyint(1) DEFAULT 0,
  `canEditSettings` tinyint(1) DEFAULT 0,
  
  -- Permissões de Usuários
  `canCreateUsers` tinyint(1) DEFAULT 0,
  `canEditUsers` tinyint(1) DEFAULT 0,
  `canDeleteUsers` tinyint(1) DEFAULT 0,
  `canViewUsers` tinyint(1) DEFAULT 0,
  
  -- Permissões de Filas
  `canCreateQueues` tinyint(1) DEFAULT 0,
  `canEditQueues` tinyint(1) DEFAULT 0,
  `canDeleteQueues` tinyint(1) DEFAULT 0,
  `canViewQueues` tinyint(1) DEFAULT 1,
  
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_company_permission` (`userId`, `companyId`),
  KEY `idx_permissions_company` (`companyId`),
  CONSTRAINT `fk_permissions_user` FOREIGN KEY (`userId`) REFERENCES `Users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_permissions_company` FOREIGN KEY (`companyId`) REFERENCES `Companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- 4. ALTERAR TABELA MESSAGES - ADICIONAR CAMPO isEdited
-- ================================================
ALTER TABLE `Messages` ADD COLUMN IF NOT EXISTS `isEdited` tinyint(1) NOT NULL DEFAULT 0;

-- ================================================
-- 5. CRIAR PERMISSÕES PADRÃO PARA USUÁRIOS EXISTENTES
-- ================================================

-- Permissões para usuários comuns
INSERT IGNORE INTO `UserPermissions` (
  `userId`, `companyId`, `createdAt`, `updatedAt`
)
SELECT 
  `id`, `companyId`, NOW(), NOW() 
FROM `Users` 
WHERE `profile` = 'user';

-- Permissões para administradores
INSERT IGNORE INTO `UserPermissions` (
  `userId`, `companyId`, 
  `canViewAllTickets`, `canEditAllTickets`, `canDeleteTickets`, 
  `canEditAllSchedules`, `canDeleteAllSchedules`,
  `canCreateCampaigns`, `canEditCampaigns`, `canDeleteCampaigns`,
  `canViewReports`, `canExportReports`, 
  `canViewSettings`, `canEditSettings`, 
  `canCreateUsers`, `canEditUsers`, `canDeleteUsers`, `canViewUsers`, 
  `canCreateQueues`, `canEditQueues`, `canDeleteQueues`, 
  `createdAt`, `updatedAt`
)
SELECT 
  `id`, `companyId`, 
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 
  NOW(), NOW()
FROM `Users` 
WHERE `profile` = 'admin';

-- ================================================
-- 6. CRIAR ALGUNS STICKERS PADRÃO (OPCIONAL)
-- ================================================

-- Inserir algumas categorias de stickers padrão se não existirem
-- (Você pode adicionar stickers reais depois via interface)

-- ================================================
-- 7. ÍNDICES ADICIONAIS PARA PERFORMANCE
-- ================================================

-- Índice para busca de mensagens editadas
CREATE INDEX IF NOT EXISTS `idx_messages_edited` ON `Messages` (`isEdited`);

-- Índice para busca rápida de reações por mensagem
CREATE INDEX IF NOT EXISTS `idx_reactions_message_user` ON `MessageReactions` (`messageId`, `userId`);

-- Índice para busca de stickers por categoria e empresa
CREATE INDEX IF NOT EXISTS `idx_stickers_category_company` ON `Stickers` (`category`, `companyId`, `isActive`);

-- ================================================
-- 8. CONFIGURAÇÕES PADRÃO (OPCIONAL)
-- ================================================

-- Inserir configurações padrão se não existirem
INSERT IGNORE INTO `Settings` (`key`, `value`, `companyId`, `createdAt`, `updatedAt`)
SELECT 
  'stickerEnabled', 'enabled', `id`, NOW(), NOW()
FROM `Companies`;

INSERT IGNORE INTO `Settings` (`key`, `value`, `companyId`, `createdAt`, `updatedAt`)
SELECT 
  'messageReactionsEnabled', 'enabled', `id`, NOW(), NOW()
FROM `Companies`;

INSERT IGNORE INTO `Settings` (`key`, `value`, `companyId`, `createdAt`, `updatedAt`)
SELECT 
  'messageEditEnabled', 'enabled', `id`, NOW(), NOW()
FROM `Companies`;

-- ================================================
-- 9. VERIFICAÇÕES DE INTEGRIDADE
-- ================================================

-- Verificar se todas as tabelas foram criadas
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Stickers') 
    THEN '✅ Tabela Stickers criada com sucesso'
    ELSE '❌ Erro ao criar tabela Stickers'
  END as status_stickers;

SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'MessageReactions') 
    THEN '✅ Tabela MessageReactions criada com sucesso'
    ELSE '❌ Erro ao criar tabela MessageReactions'
  END as status_reactions;

SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'UserPermissions') 
    THEN '✅ Tabela UserPermissions criada com sucesso'
    ELSE '❌ Erro ao criar tabela UserPermissions'
  END as status_permissions;

-- Verificar se a coluna isEdited foi adicionada
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'Messages' AND column_name = 'isEdited'
    ) 
    THEN '✅ Campo isEdited adicionado à tabela Messages'
    ELSE '❌ Erro ao adicionar campo isEdited'
  END as status_messages;

-- Contar permissões criadas
SELECT 
  CONCAT('✅ Permissões criadas para ', COUNT(*), ' usuários') as status_user_permissions
FROM `UserPermissions`;

SET FOREIGN_KEY_CHECKS = 1;

-- ================================================
-- MIGRAÇÃO CONCLUÍDA COM SUCESSO!
-- ================================================

SELECT '🎉 MIGRAÇÃO PARA WHATICKET SAAS v2.0 CONCLUÍDA COM SUCESSO!' as resultado;
SELECT '✅ Novas funcionalidades: Stickers, Reações, Edição de Mensagens, Permissões Granulares' as funcionalidades;
SELECT '🚀 Sistema pronto para uso!' as status_final;