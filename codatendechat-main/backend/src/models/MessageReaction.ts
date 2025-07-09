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
import Message from "./Message";
import User from "./User";
import Company from "./Company";

@Table
class MessageReaction extends Model<MessageReaction> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Message)
  @Column
  messageId: string;

  @BelongsTo(() => Message)
  message: Message;

  @ForeignKey(() => User)
  @Column
  userId: number;

  @BelongsTo(() => User)
  user: User;

  @Column
  reaction: string; // emoji da reação (😀, 👍, ❤️, etc.)

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default MessageReaction;