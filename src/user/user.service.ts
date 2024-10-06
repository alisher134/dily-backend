import {
	BadRequestException,
	Injectable,
	NotFoundException
} from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { hash } from 'argon2';
import { AuthDto } from 'src/auth/dto/auth.dto';
import { PaginationService } from 'src/pagination/pagination.service';
import { PrismaService } from 'src/prisma.service';
import { EnumSort, FilterUserDto, UpdateUserDto } from './dto/update-user.dto';
import { IUser } from './user.interface';
import { IUserResponse, UserSelect } from './user.select';

@Injectable()
export class UserService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly paginationService: PaginationService
	) {}

	async getByEmail(email: string): Promise<User | null> {
		return await this.prismaService.user.findUnique({
			where: { email },
			select: UserSelect
		});
	}

	async getByUsername(username: string): Promise<IUser | null> {
		return await this.prismaService.user.findUnique({
			where: { username },
			select: UserSelect
		});
	}

	//* Admin endpoints

	async getAll(dto: FilterUserDto): Promise<IUserResponse> {
		const { perPage, skip } = this.paginationService.getPagination(dto);

		const searchTermQuery = dto.searchTerm
			? this.getSearchTermFilter(dto.searchTerm)
			: {};

		const users = await this.prismaService.user.findMany({
			where: searchTermQuery,
			orderBy: this.getSortOptions(dto.sort),
			select: UserSelect,
			take: perPage,
			skip
		});

		const totalCount = users.length;

		return { users, totalCount };
	}

	async getById(id: string): Promise<User> {
		const user = await this.prismaService.user.findUnique({
			where: { id },
			select: UserSelect
		});

		if (!user) throw new NotFoundException('Пользователь не найден!');

		return user;
	}

	async create(dto: AuthDto): Promise<User> {
		const userData: Prisma.UserCreateInput = {
			...dto,
			password: await this.hashPassword(dto.password)
		};

		return await this.prismaService.user.create({
			data: userData,
			select: UserSelect
		});
	}

	async update(dto: UpdateUserDto, id: string): Promise<IUser> {
		await this.validateUniqueFields(dto, id);

		const user = await this.getById(id);

		const userData: Prisma.UserUpdateInput = {
			...dto,
			password: dto.password
				? await this.hashPassword(dto.password)
				: user.password
		};

		return await this.prismaService.user.update({
			where: { id },
			data: userData,
			select: UserSelect
		});
	}

	async delete(id: string): Promise<{ message: string }> {
		await this.getById(id);

		await this.prismaService.user.delete({
			where: { id }
		});

		return {
			message: `Пользователь с id - ${id} был удален`
		};
	}

	private getSearchTermFilter(searchTerm: string): Prisma.UserWhereInput {
		return {
			OR: [
				{
					email: {
						contains: searchTerm,
						mode: 'insensitive'
					}
				},
				{
					username: {
						contains: searchTerm,
						mode: 'insensitive'
					}
				}
			]
		};
	}

	private getSortOptions(sort: EnumSort): Prisma.UserOrderByWithRelationInput {
		return sort === EnumSort.OLDEST
			? { createdAt: 'asc' }
			: { createdAt: 'desc' };
	}

	private async validateUniqueFields(dto: UpdateUserDto, id: string) {
		const existingEmail = await this.getByEmail(dto.email);
		if (existingEmail && existingEmail.id !== id)
			throw new BadRequestException('Email уже используется!');

		if (dto.username) {
			const existingUsernameUser = await this.getByUsername(dto.username);

			if (existingUsernameUser && existingUsernameUser.id !== id)
				throw new BadRequestException('Username уже используется!');
		}
	}

	private async hashPassword(password: string): Promise<string> {
		return await hash(password);
	}
}
