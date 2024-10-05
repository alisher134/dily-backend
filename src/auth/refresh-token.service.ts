import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { isProd } from 'src/utils/dev.utils';

@Injectable()
export class RefreshTokenService {
	REFRESH_TOKEN_NAME = 'refreshToken';
	private EXPIRATION_REFRESH_TOKEN_DAY = 1;

	constructor(private readonly configService: ConfigService) {}

	addRefreshTokenToResponse(res: Response, refreshToken: string) {
		const expires = new Date();
		expires.setDate(expires.getDate() + this.EXPIRATION_REFRESH_TOKEN_DAY);

		res.cookie(this.REFRESH_TOKEN_NAME, refreshToken, {
			httpOnly: true,
			expires,
			domain: isProd(this.configService)
				? this.configService.get('DOMAIN')
				: 'localhost',
			secure: isProd(this.configService),
			sameSite: 'lax'
		});
	}

	removeRefreshTokenFromResponse(res: Response) {
		res.cookie(this.REFRESH_TOKEN_NAME, '', {
			httpOnly: true,
			expires: new Date(0),
			domain: isProd(this.configService)
				? this.configService.get('DOMAIN')
				: 'localhost',
			secure: isProd(this.configService),
			sameSite: 'lax'
		});
	}
}
