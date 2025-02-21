export class GetUsersDto {
    status: string;
    data?: any;
  
    constructor(partial: Partial<GetUsersDto>) {
      Object.assign(this, partial);
    }
  }  