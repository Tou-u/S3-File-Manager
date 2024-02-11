import type { Lucia } from 'lucia';

declare global {
	namespace App {
		interface Locals {
			db: D1Database;
			lucia: Lucia;
			user: { username: string; id: string } | null;
			session: import('lucia').Session | null;
		}
		interface Platform {
			env: {
				DB: D1Database;
			};
		}
	}
}

export {};
