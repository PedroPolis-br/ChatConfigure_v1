import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo
} from "sequelize-typescript";
import User from "./User";
import Company from "./Company";

@Table
class UserPermission extends Model<UserPermission> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => User)
  @Column
  userId: number;

  @BelongsTo(() => User)
  user: User;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  // Permissões de Tickets
  @Column(DataType.BOOLEAN)
  canCreateTickets: boolean;

  @Column(DataType.BOOLEAN)
  canViewAllTickets: boolean;

  @Column(DataType.BOOLEAN)
  canEditAllTickets: boolean;

  @Column(DataType.BOOLEAN)
  canDeleteTickets: boolean;

  @Column(DataType.BOOLEAN)
  canTransferTickets: boolean;

  @Column(DataType.BOOLEAN)
  canCloseTickets: boolean;

  // Permissões de Contatos
  @Column(DataType.BOOLEAN)
  canCreateContacts: boolean;

  @Column(DataType.BOOLEAN)
  canEditContacts: boolean;

  @Column(DataType.BOOLEAN)
  canDeleteContacts: boolean;

  @Column(DataType.BOOLEAN)
  canViewContacts: boolean;

  // Permissões de Agendamentos
  @Column(DataType.BOOLEAN)
  canCreateSchedules: boolean;

  @Column(DataType.BOOLEAN)
  canEditOwnSchedules: boolean;

  @Column(DataType.BOOLEAN)
  canEditAllSchedules: boolean;

  @Column(DataType.BOOLEAN)
  canDeleteOwnSchedules: boolean;

  @Column(DataType.BOOLEAN)
  canDeleteAllSchedules: boolean;

  @Column(DataType.BOOLEAN)
  canViewSchedules: boolean;

  // Permissões de Campanhas
  @Column(DataType.BOOLEAN)
  canCreateCampaigns: boolean;

  @Column(DataType.BOOLEAN)
  canEditCampaigns: boolean;

  @Column(DataType.BOOLEAN)
  canDeleteCampaigns: boolean;

  @Column(DataType.BOOLEAN)
  canViewCampaigns: boolean;

  // Permissões de Relatórios
  @Column(DataType.BOOLEAN)
  canViewReports: boolean;

  @Column(DataType.BOOLEAN)
  canExportReports: boolean;

  // Permissões de Configurações
  @Column(DataType.BOOLEAN)
  canViewSettings: boolean;

  @Column(DataType.BOOLEAN)
  canEditSettings: boolean;

  // Permissões de Usuários
  @Column(DataType.BOOLEAN)
  canCreateUsers: boolean;

  @Column(DataType.BOOLEAN)
  canEditUsers: boolean;

  @Column(DataType.BOOLEAN)
  canDeleteUsers: boolean;

  @Column(DataType.BOOLEAN)
  canViewUsers: boolean;

  // Permissões de Filas
  @Column(DataType.BOOLEAN)
  canCreateQueues: boolean;

  @Column(DataType.BOOLEAN)
  canEditQueues: boolean;

  @Column(DataType.BOOLEAN)
  canDeleteQueues: boolean;

  @Column(DataType.BOOLEAN)
  canViewQueues: boolean;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default UserPermission;