export type FullMessage = {
  id: number;
  content: string | null;
  createdAt: Date;
  fileKey: string | null;
  memberId: number;
  updatedAt: Date;
  member: {
    id: number;
    user: {
      name: string;
      image: string | null;
    }
  };
  seenMessages: {
    createdAt: Date;
    member: {
      id: number;
      user: {
        name: string;
        image: string | null;
      }
    }
  }[];
}