import { FoundItem } from '../found-item.entity';
import { User } from '../../user/user.entity';

export interface FoundItemResponse {
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