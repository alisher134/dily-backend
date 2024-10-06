import { Prisma } from '@prisma/client';
import { IUser } from './user.interface';

export const UserSelect: Prisma.UserSelect = {
	id: true,
	createdAt: true,
	updatedAt: true,
	email: true,
	username: true,
	role: true,
	avatarPath: true,
	password: false
};

export interface IUserResponse {
	users: IUser[];
	totalCount: number;
}
