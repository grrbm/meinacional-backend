import { DataTypes, Model } from "sequelize";
import { Table, Column, HasMany, Index } from "sequelize-typescript";
import { DefaultModel } from "../sensible-utilities/DefaultModel";
import { UserType } from "../UserType/types";
export type UserRole = "admin" | "host" | "writer" | "guest";
export interface UserCreationType extends Partial<UserType> {}

@Table
export class User
  extends DefaultModel<UserType, UserCreationType>
  implements UserType
{
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

  @Index({ unique: true })
  @Column
  public email!: string;

  @Column
  public phone!: string;
}

export default User;
