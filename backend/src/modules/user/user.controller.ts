import { Controller, Get, Res, Post, Body } from '@nestjs/common';
import { Response } from 'express';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './user.entity';
import { GetUsersDto } from './dto/get-users.dto';

@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Post('createUser')
    async createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
        return this.userService.createUser(createUserDto);
    }

    @Get('getUsers')
    async getUsers(@Res() res: Response) {
        try {
            const users = await this.userService.getAllUsers();
            return res.status(200).json(
                new GetUsersDto({
                    status: 'success',
                    data: users,
                })
            );
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: 'Failed to fetch users',
            });
        }
    }
}
