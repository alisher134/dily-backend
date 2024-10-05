import {
	IsEmail,
	IsNotEmpty,
	IsOptional,
	IsString,
	MinLength
} from 'class-validator';

export class AuthDto {
	@IsEmail({}, { message: 'Введите корректный email адрес' })
	@IsNotEmpty({ message: 'Email не должен быть пустым' })
	email: string;

	@IsString({ message: 'Password должен быть строкой' })
	@MinLength(8, { message: 'Password должен содержать минимум 8 символов' })
	@IsNotEmpty({ message: 'Password не должен быть пустым' })
	password: string;

	@IsOptional()
	@IsString({ message: 'Username должен быть строкой' })
	@MinLength(3, { message: 'Username должен содержать минимум 3 символа' })
	@IsNotEmpty({ message: 'Username не должен быть пустым' })
	username: string;
}
