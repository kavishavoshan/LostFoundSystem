import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Model } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ 
  timestamps: true,
  toJSON: { virtuals: true } // Include virtuals like 'id'
})
export class User {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({
    required: false,
    unique: false,
    set: (value: string) => {
      // If no value is provided, return undefined
      if (!value) {
        return undefined;
      }
      return value;
    }
  })
  mobileNumber: string;

  @Prop({
    required: false,
    unique: false,
    set: (value: string) => {
      // If no value is provided, return undefined
      if (!value) {
        return undefined;
      }
      return value;
    }
  })
  contact: string;

  @Prop()
  avatarUrl: string;

  @Prop()
  coverImageUrl: string;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop({ default: 'user' })
  role: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Add a pre-save hook to handle mobile number uniqueness
UserSchema.pre('save', async function(next) {
  if (this.isModified('mobileNumber') && this.mobileNumber) {
    const model = this.constructor as Model<UserDocument>;
    const existingUser = await model.findOne({ 
      mobileNumber: this.mobileNumber,
      _id: { $ne: this._id }
    });
    if (existingUser) {
      throw new Error('Mobile number is already in use');
    }
  }
  next();
});
