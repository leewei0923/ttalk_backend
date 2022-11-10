export interface addFriendType {
  type: 'apply' | 'accept' | 'black';
  user_account: string;
  friend_account: string;
}
