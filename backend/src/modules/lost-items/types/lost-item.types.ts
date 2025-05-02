import { User } from '../../user/user.entity';

export interface LostItemResponse {
  userId: User;
  image: string | null;
  imageContentType: string;
  description: string;
  location: string;
  contactNumber: string;
  category: string;
  clip_vector?: number[];
  createdAt: Date;
  _id: string;
}