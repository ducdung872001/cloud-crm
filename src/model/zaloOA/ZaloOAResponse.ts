export interface IZaloOAResponse {
  id: number;
  accessToken: string;
  active: number;
  avatar: string;
  bsnId: number;
  cover: string;
  createdTime: string;
  description: string;
  expiredDate: string;
  isVerified: true;
  name: string;
  oaId: string;
  statusFollower: number;
}

export interface IZaloFollowerResponse {
  if: number;
}

//* Định nghĩa các kiểu type trong Attachment

interface ITypeImageAttachment {
  payload: {
    thumbnail: string;
    url: string;
  };
  type: string;
}

interface ITypeGifAttachment {
  payload: {
    thumbnail: string;
    url: string;
  };
  type: string;
}

interface ITypeLinkAttachment {
  payload: {
    thumbnail: string;
    description: string;
    url: string;
  };
  type: string;
}

interface ITypeAudioAttachment {
  payload: {
    url: string;
  };
  type: string;
}

interface ITypeVideoAttachment {
  payload: {
    thumbnail: string;
    description: string;
    url: string;
  };
  type: string;
}

interface ITypeStickerAttachment {
  payload: {
    id: string;
    url: string;
  };
  type: string;
}

interface ITypeLocationAttachment {
  payload: {
    coordinates: {
      latitude: string;
      longitude: string;
    };
  };
  type: string;
}

interface ITypeFileAttachment {
  payload: {
    size: string;
    name: string;
    checksum: string;
    type: string;
    url: string;
  };
  type: string;
}

export interface IZaloChatResponse {
  id: number;
  messageId: string;
  src: number;
  publishedTime: any;
  type: string;
  message: string;
  attachments: string;
  // attachments:
  //   | ITypeImageAttachment[]
  //   | ITypeGifAttachment[]
  //   | ITypeLinkAttachment[]
  //   | ITypeAudioAttachment[]
  //   | ITypeVideoAttachment[]
  //   | ITypeStickerAttachment[]
  //   | ITypeLocationAttachment[]
  //   | ITypeFileAttachment[];
  fromId: string;
  toId: string;
  fromDisplayName: string;
  fromAvatar: string;
  toDisplayName: string;
  toAvatar: string;
  createdTime: any;
  userIdByApp: string;
}
