import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class AuthDto {
	@IsEmail()
	email: string;

	@IsString()
	@MinLength(8, { message: 'Password должен содержать минимум 8 символов' })
	password: string;

	@IsOptional()
	@IsString()
	@MinLength(3, { message: 'Username должен содержать минимум 3 символа' })
	username: string;
}
