import { DataTypes } from "sequelize";
import { Table, Column, HasMany, Index } from "sequelize-typescript";
export type UserRole = "admin" | "host" | "writer" | "guest";

@Table
export class User {
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

  @Column({ type: DataTypes.STRING(1024) })
  public text!: string;

  @Index({ unique: true })
  @Column
  public email!: string;

  @Column
  public phone!: string;

  @Column
  public code!: string;

  @Column
  public image!: string;

  @Column({ type: DataTypes.STRING(1024) })
  public base64!: string;

  @Column
  public language!: string;

  @Column
  public country!: string;

  @Column
  public city!: string;

  // @Column({
  //   type: DataTypes.ENUM(...userRoles),
  //   defaultValue: "guest",
  // })
  // public role!: UserRole;

  @Column({ type: DataTypes.BOOLEAN, defaultValue: false })
  public verified!: boolean;

  @Column({ type: DataTypes.STRING(1024) })
  public subscribed!: string;

  @Column
  public resetPasswordHash!: string;

  @Column
  public paymentCustomerId!: string;

  //assocations
}

export default User;
