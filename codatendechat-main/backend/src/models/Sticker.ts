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
import Company from "./Company";

@Table
class Sticker extends Model<Sticker> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  name: string;

  @Column
  description: string;

  @Column
  category: string;

  @Column
  filePath: string;

  @Column
  fileName: string;

  @Column
  mimeType: string;

  @Column
  fileSize: number;

  @Column(DataType.BOOLEAN)
  isActive: boolean;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @Column(DataType.VIRTUAL)
  get stickerUrl(): string | null {
    if (this.getDataValue("filePath")) {
      return `${process.env.BACKEND_URL}/public/stickers/${this.getDataValue("filePath")}`;
    }
    return null;
  }
}

export default Sticker;