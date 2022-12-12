import { DataTypes, Model } from "sequelize";
import { Table, Column, HasMany, Index } from "sequelize-typescript";
export type UserRole = "admin" | "host" | "writer" | "guest";

@Table
export class User extends Model {
  @Index({ unique: true })
  @Column
  public loginToken!: string;

  @Column({ type: DataTypes.BIGINT.UNSIGNED, defaultValue: 0 })
  public onlineAt!: number;

  @Column
  public username!: string;

  @Column
  public password!: string;

  @Column
  public temporaryPassword!: string;

  @Column
  public name!: string;
}

export default User;
