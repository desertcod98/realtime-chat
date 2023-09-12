export type FullMessage = {
  id: number;
  content: string | null;
  createdAt: Date;
  fileKey: string | null;
  memberId: number;
  updatedAt: Date;
  messageFiles: {
    url: string;
    name: string;
  }[];
  member: {
    id: number;
    user: {
      name: string;
      image: string | null;
    };
  };
  seenMessages: {
    createdAt: Date;
    member: {
      id: number;
      user: {
        name: string;
        image: string | null;
      };
    };
  }[];
};

export type FullMember = {
  id: number;
  userId: string;
  createdAt: Date;
  chatId: string;
  isAdministrator: boolean | null;
  isRemoved: boolean | null;
  user: {
    name: string;
    image: string | null;
  };
};

export type FullInvite = {
  id: number;
  expiresAt: Date;
  inviterId: number;
  inviter: {
    id: number;
    user: {
      name: string;
      image: string | null;
    };
    chat: {
      id: string;
      name: string | null;
      image: string | null;
      isGroup: boolean;
    };
  };
};

export type TempFullInvite = {
  id: number;
  inviterId: number;
  inviterImage: string | null;
  inviterName: string;
  expiresAt: Date;
}