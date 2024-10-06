import { User } from '@prisma/client';

export interface ITokens {
	accessToken: string;
	refreshToken: string;
}

export interface IAuthResponse extends ITokens {
	user: Omit<User, 'password'>;
}
