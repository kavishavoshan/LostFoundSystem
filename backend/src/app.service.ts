import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(@InjectConnection() private connection: Connection) {}

  async onModuleInit() {
    // Test MongoDB connection
    try {
      const dbStatus = this.connection.readyState;
      console.log(`MongoDB connection status: ${dbStatus === 1 ? 'Connected' : 'Not connected'}`);
      
      if (dbStatus === 1) {
        console.log(`Connected to MongoDB database: ${this.connection.name}`);
      }
    } catch (error) {
      console.error('MongoDB connection error:', error);
    }
  }

  getHello(): string {
    return 'Hello World!';
  }
}
