import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
    private users: any[] = [];

    async createUser(createUserDto: CreateUserDto) {
        const newUser = {
            id: Date.now().toString(),
            ...createUserDto,
        };
        this.users.push(newUser);
        return newUser;
    }

    async findByEmail(email: string) {
        return this.users.find(user => user.email === email);
    }

    async getAllUsers() {
        return this.users;
    }

    async getUserById(id: string) {
        return this.users.find(user => user.id === id);
    }

    async updateUser(id: string, updateUserDto: UpdateUserDto) {
        const userIndex = this.users.findIndex(user => user.id === id);
        if (userIndex > -1) {
            this.users[userIndex] = { ...this.users[userIndex], ...updateUserDto };
            return this.users[userIndex];
        }
        return null;
    }

    async deleteUser(id: string) {
        const userIndex = this.users.findIndex(user => user.id === id);
        if (userIndex > -1) {
            const deletedUser = this.users[userIndex];
            this.users.splice(userIndex, 1);
            return deletedUser;
        }
        return null;
    }
}