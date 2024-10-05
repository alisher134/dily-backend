import {
	BadRequestException,
	Injectable,
	UnauthorizedException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EnumUserRole, User } from '@prisma/client';
import { verify } from 'argon2';
import { UserService } from 'src/user/user.service';
import { AuthDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
	private EXPIRATION_ACCESS_TOKEN = '1h';
	private EXPIRATION_REFRESH_TOKEN = '1d';

	constructor(
		private readonly userService: UserService,
		private readonly jwtService: JwtService
	) {}

	async login(dto: AuthDto) {
		const user = await this.validateUser(dto);

		return this.generateResponse(user);
	}

	async register(dto: AuthDto) {
		await this.checkExists(dto.email, dto.username);

		const user = await this.userService.create(dto);

		return this.generateResponse(user);
	}

	async getNewTokens(refreshToken: string) {
		if (!refreshToken)
			throw new UnauthorizedException(
				'К сожалению, мы не обнаружили ваш refresh токен. Пожалуйста, войдите в систему для получения нового токена'
			);

		const result = await this.jwtService.verifyAsync(refreshToken);

		const user = await this.userService.getById(result.id);

		return this.generateResponse(user);
	}

	private async checkExists(email: string, username: string) {
		const isExistsEmail = await this.userService.getByEmail(email);
		if (isExistsEmail) throw new BadRequestException('Email занят');

		const isExistsUsername = await this.userService.getByUsername(username);
		if (isExistsUsername) throw new BadRequestException('Username занят');

		return false;
	}

	private async validateUser(dto: AuthDto) {
		const user = await this.userService.getByEmail(dto.email);
		if (!user) throw new BadRequestException('Неверный email или password');

		const isValidPassword = await verify(user.password, dto.password);
		if (!isValidPassword)
			throw new BadRequestException('Неверный email или password');

		return user;
	}

	private async generateToken(userId: string, role: EnumUserRole) {
		const payload = { id: userId, role };

		const accessToken = await this.jwtService.signAsync(payload, {
			expiresIn: this.EXPIRATION_ACCESS_TOKEN
		});

		const refreshToken = await this.jwtService.signAsync(payload, {
			expiresIn: this.EXPIRATION_REFRESH_TOKEN
		});

		return { accessToken, refreshToken };
	}

	private omitPassword(user: User) {
		const { password, ...rest } = user;

		return rest;
	}

	private async generateResponse(user: User) {
		const tokens = await this.generateToken(user.id, user.role);

		return {
			user: this.omitPassword(user),
			...tokens
		};
	}
}
