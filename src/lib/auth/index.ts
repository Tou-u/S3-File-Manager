import { Lucia } from 'lucia';
import { D1Adapter } from '@lucia-auth/adapter-sqlite';
import { dev } from '$app/environment';

export function initializeLucia(D1: unknown) {
	const adapter = new D1Adapter(D1, {
		user: 'user',
		session: 'session'
	});
	return new Lucia(adapter, {
		sessionCookie: { attributes: { secure: !dev } },
		getUserAttributes: (attributes) => {
			return {
				username: attributes.username
			};
		}
	});
}

declare module 'lucia' {
	export interface Register {
		exportAuth: ReturnType<typeof initializeLucia>;
		DatabaseUserAttributes: { username: string };
	}
}
