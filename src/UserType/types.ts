import { DefaultModelType } from "../sensible-utilities/DefaultModelType";

export interface PublicUserType extends DefaultModelType {
  username: string | null;
  name: string | null;
}
export type MeUserType = PublicUserType & {
  /** Phone @example "+31611112222" */
  phone: string | null;

  /** Email @example wijnand@karsens.com */
  email: string | null;
};
export type UserType = MeUserType & {
  /** Password @example "hoihoi" */
  password: string | null;
};
