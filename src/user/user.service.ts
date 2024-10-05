import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { hash } from 'argon2';
import { AuthDto } from 'src/auth/dto/auth.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class UserService {
	constructor(private readonly prismaService: PrismaService) {}

	async getByEmail(email: string) {
		return await this.prismaService.user.findUnique({
			where: { email }
		});
	}

	async getByUsername(username: string) {
		return await this.prismaService.user.findUnique({
			where: { username }
		});
	}

	async getById(id: string) {
		const user = await this.prismaService.user.findUnique({
			where: { id }
		});

		if (!user) throw new NotFoundException('Пользователь не найден!');

		return user;
	}

	async create(dto: AuthDto) {
		const userData: Prisma.UserCreateInput = {
			...dto,
			password: await hash(dto.password)
		};

		return await this.prismaService.user.create({
			data: userData
		});
	}
}
