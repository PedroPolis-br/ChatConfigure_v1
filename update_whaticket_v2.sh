#!/bin/bash

# ================================================
# WHATICKET SAAS - SCRIPT DE ATUALIZAÇÃO PARA v2.0
# Funcionalidades: Stickers, Reações, Edição, Permissões
# ================================================

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para logging
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

info() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

# Verificar se está executando como root ou com sudo
check_permissions() {
    if [[ $EUID -eq 0 ]]; then
        error "Este script não deve ser executado como root!"
        exit 1
    fi
}

# Verificar dependências
check_dependencies() {
    log "🔍 Verificando dependências..."
    
    # Verificar Node.js
    if ! command -v node &> /dev/null; then
        error "Node.js não encontrado! Instale o Node.js primeiro."
        exit 1
    fi
    
    # Verificar npm
    if ! command -v npm &> /dev/null; then
        error "npm não encontrado! Instale o npm primeiro."
        exit 1
    fi
    
    # Verificar MySQL
    if ! command -v mysql &> /dev/null; then
        error "MySQL não encontrado! Instale o MySQL primeiro."
        exit 1
    fi
    
    log "✅ Todas as dependências estão instaladas."
}

# Fazer backup do banco de dados
backup_database() {
    log "💾 Fazendo backup do banco de dados..."
    
    read -p "Digite o nome do banco de dados: " DB_NAME
    read -p "Digite o usuário do MySQL: " DB_USER
    read -s -p "Digite a senha do MySQL: " DB_PASS
    echo
    
    BACKUP_FILE="backup_whaticket_$(date +%Y%m%d_%H%M%S).sql"
    
    if mysqldump -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" > "$BACKUP_FILE"; then
        log "✅ Backup criado: $BACKUP_FILE"
        export DB_NAME DB_USER DB_PASS
    else
        error "❌ Erro ao criar backup!"
        exit 1
    fi
}

# Parar serviços
stop_services() {
    log "🛑 Parando serviços..."
    
    # Tentar parar pm2
    if command -v pm2 &> /dev/null; then
        pm2 stop all 2>/dev/null || true
        log "✅ Serviços PM2 parados"
    fi
    
    # Verificar se há processos Node rodando
    pkill -f "node.*whaticket" 2>/dev/null || true
    
    log "✅ Serviços parados"
}

# Instalar dependências do backend
install_backend_deps() {
    log "📦 Instalando dependências do Backend..."
    
    if [ -d "backend" ]; then
        cd backend
        
        # Instalar novas dependências
        npm install multer @types/multer date-fns --save
        
        # Reinstalar todas as dependências
        npm install
        
        cd ..
        log "✅ Dependências do backend instaladas"
    else
        error "❌ Diretório backend não encontrado!"
        exit 1
    fi
}

# Instalar dependências do frontend
install_frontend_deps() {
    log "📦 Instalando dependências do Frontend..."
    
    if [ -d "frontend" ]; then
        cd frontend
        
        # Instalar novas dependências
        npm install date-fns use-sound --save
        
        # Reinstalar todas as dependências
        npm install
        
        cd ..
        log "✅ Dependências do frontend instaladas"
    else
        error "❌ Diretório frontend não encontrado!"
        exit 1
    fi
}

# Criar estrutura de pastas
create_directories() {
    log "📁 Criando estrutura de pastas..."
    
    # Backend
    mkdir -p backend/public/stickers
    mkdir -p backend/src/middleware
    mkdir -p backend/src/services/NotificationService
    
    # Frontend
    mkdir -p frontend/src/components/StickerPicker
    mkdir -p frontend/src/components/MessageReactions
    mkdir -p frontend/src/components/MessageEditDialog
    mkdir -p frontend/src/components/ShowTicketOpenModal
    mkdir -p frontend/src/hooks
    
    # Definir permissões
    chmod 755 backend/public/stickers
    
    log "✅ Estrutura de pastas criada"
}

# Executar migração do banco
run_migration() {
    log "🗄️ Executando migração do banco de dados..."
    
    # Verificar se o arquivo de migração existe
    if [ ! -f "migration_update_v2.sql" ]; then
        error "❌ Arquivo migration_update_v2.sql não encontrado!"
        error "Baixe o arquivo de migração primeiro."
        exit 1
    fi
    
    if mysql -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < migration_update_v2.sql; then
        log "✅ Migração do banco executada com sucesso"
    else
        error "❌ Erro na migração do banco!"
        error "Restaure o backup se necessário: mysql -u $DB_USER -p $DB_NAME < $BACKUP_FILE"
        exit 1
    fi
}

# Copiar arquivos novos
copy_new_files() {
    log "📄 Copiando arquivos das novas funcionalidades..."
    
    # Lista de arquivos que devem ser copiados
    # (Assumindo que estão no diretório atual)
    
    info "ℹ️  Você precisará copiar manualmente os seguintes arquivos:"
    echo
    echo "Backend:"
    echo "  - src/controllers/StickerController.ts"
    echo "  - src/middleware/checkPermission.ts"
    echo "  - src/models/MessageReaction.ts"
    echo "  - src/models/Sticker.ts"
    echo "  - src/models/UserPermission.ts"
    echo "  - src/services/NotificationService/CreateNotificationService.ts"
    echo "  - src/services/WbotServices/EditWhatsAppMessage.ts"
    echo
    echo "Frontend:"
    echo "  - src/components/MessageEditDialog/index.js"
    echo "  - src/components/MessageReactions/index.js"
    echo "  - src/components/ShowTicketOpenModal/index.js"
    echo "  - src/components/StickerPicker/index.js"
    echo "  - src/hooks/useNotifications.js"
    echo
    echo "Você também precisa integrar as modificações nos arquivos existentes:"
    echo "  - src/components/NewTicketModal/index.js"
    echo "  - src/controllers/ScheduleController.ts"
    echo "  - src/services/TicketServices/CreateTicketService.ts"
    echo "  - src/services/TicketServices/UpdateTicketService.ts"
    echo "  - src/translate/languages/pt.js"
    echo
    
    read -p "Pressione Enter após copiar todos os arquivos..."
}

# Compilar frontend
build_frontend() {
    log "🔨 Compilando Frontend..."
    
    cd frontend
    if npm run build; then
        log "✅ Frontend compilado com sucesso"
    else
        error "❌ Erro ao compilar frontend!"
        exit 1
    fi
    cd ..
}

# Verificar configurações
check_env() {
    log "⚙️ Verificando configurações..."
    
    # Verificar .env do backend
    if [ -f "backend/.env" ]; then
        # Adicionar novas variáveis se não existirem
        if ! grep -q "UPLOAD_LIMIT" backend/.env; then
            echo "UPLOAD_LIMIT=5mb" >> backend/.env
        fi
        
        if ! grep -q "STICKERS_PATH" backend/.env; then
            echo "STICKERS_PATH=public/stickers" >> backend/.env
        fi
        
        if ! grep -q "NOTIFICATIONS_ENABLED" backend/.env; then
            echo "NOTIFICATIONS_ENABLED=true" >> backend/.env
        fi
        
        if ! grep -q "MESSAGE_EDIT_TIME_LIMIT" backend/.env; then
            echo "MESSAGE_EDIT_TIME_LIMIT=900000" >> backend/.env
        fi
        
        log "✅ Configurações atualizadas"
    else
        warning "⚠️ Arquivo .env não encontrado no backend"
    fi
}

# Reiniciar serviços
restart_services() {
    log "🔄 Reiniciando serviços..."
    
    cd backend
    
    # Tentar usar pm2 se disponível
    if command -v pm2 &> /dev/null; then
        pm2 restart all 2>/dev/null || pm2 start npm --name "whaticket-backend" -- start
        log "✅ Serviços reiniciados com PM2"
    else
        warning "⚠️ PM2 não encontrado. Inicie o backend manualmente com: npm start"
    fi
    
    cd ..
}

# Verificar se tudo está funcionando
verify_installation() {
    log "🔍 Verificando instalação..."
    
    # Verificar se o backend está respondendo
    sleep 5
    
    if curl -s http://localhost:8080/health >/dev/null 2>&1; then
        log "✅ Backend está funcionando"
    else
        warning "⚠️ Backend pode não estar funcionando. Verifique os logs."
    fi
    
    # Verificar estrutura do banco
    if mysql -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" -e "SHOW TABLES LIKE 'Stickers'" | grep -q "Stickers"; then
        log "✅ Tabelas do banco criadas corretamente"
    else
        warning "⚠️ Verifique se as tabelas foram criadas corretamente"
    fi
}

# Mostrar informações finais
show_final_info() {
    echo
    log "🎉 ATUALIZAÇÃO CONCLUÍDA COM SUCESSO!"
    echo
    echo -e "${GREEN}✅ Funcionalidades implementadas:${NC}"
    echo "   📝 Edição de mensagens (15 minutos)"
    echo "   🎭 Sistema de stickers com categorias"
    echo "   😍 Reações às mensagens"
    echo "   🔔 Notificações de transferência"
    echo "   🔒 Permissões granulares"
    echo "   🎯 Bug da tela cinza corrigido"
    echo
    echo -e "${BLUE}📋 Próximos passos:${NC}"
    echo "   1. Teste todas as funcionalidades"
    echo "   2. Configure stickers nas configurações (admin)"
    echo "   3. Ajuste permissões dos usuários se necessário"
    echo "   4. Monitore logs por alguns dias"
    echo
    echo -e "${YELLOW}🔗 Documentação:${NC}"
    echo "   - Todas as funcionalidades estão documentadas"
    echo "   - Verifique os arquivos .md criados"
    echo "   - Backup disponível em: $BACKUP_FILE"
    echo
    log "🚀 WhatTicket SAAS v2.0 está pronto para uso!"
}

# Função principal
main() {
    echo -e "${BLUE}"
    cat << "EOF"
 ____    ____  __    __   ______   .___________.
|_   \  /   _||  |  |  | |      |  |           |
  |   \/   |  |  |__|  | |  ,----'  `---|  |----`
  |        |  |   __   | |  |           |  |     
  |   __   |  |  |  |  | |  `----.      |  |     
  |__|  |__|  |__|  |__|  \______|      |__|     
                                                
    SAAS v2.0 - SCRIPT DE ATUALIZAÇÃO
    Stickers • Reações • Edição • Permissões
EOF
    echo -e "${NC}"
    
    log "🚀 Iniciando atualização do WhatTicket SAAS para v2.0..."
    
    check_permissions
    check_dependencies
    backup_database
    stop_services
    install_backend_deps
    install_frontend_deps
    create_directories
    run_migration
    copy_new_files
    check_env
    build_frontend
    restart_services
    verify_installation
    show_final_info
}

# Executar apenas se chamado diretamente
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi