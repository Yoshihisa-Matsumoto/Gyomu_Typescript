export interface User {
  isGroup: boolean;
  isValid: boolean;

  userId: string;
  isEqual: (other: User) => boolean;
  isInMember: (groupUser: User) => boolean;
  region: string;
}

class DummyUser implements User {
  isGroup = false;
  isValid = true;
  userId: string;
  constructor(uid: string) {
    this.userId = uid;
  }
  isEqual = (other: User) => {
    return this.userId === other.userId;
  };
  isInMember = (_: User) => {
    return false;
  };
  region: string = '';
}

export class UserFactory {
  static getCurrentUser = (): User => {
    return new DummyUser('testUid');
  };
}
