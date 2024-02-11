import type { PageServerLoad, Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { generateId } from 'lucia';
import { createPasswordHash } from '$lib/auth/password-hasher';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) return redirect(302, '/');
	return {};
};

export const actions: Actions = {
	default: async ({ request, locals, cookies }) => {
		const formData = await request.formData();
		const username = formData.get('username');
		const password = formData.get('password');
		if (
			typeof username !== 'string' ||
			username.length < 3 ||
			username.length > 31 ||
			!/^[a-z0-9_-]+$/.test(username)
		) {
			return fail(400, {
				message: 'Invalid username'
			});
		}
		if (typeof password !== 'string' || password.length < 6 || password.length > 255) {
			return fail(400, {
				message: 'Invalid password'
			});
		}

		const hashedPassword = await createPasswordHash(password);
		const userId = generateId(15);

		try {
			await locals.db
				.prepare('INSERT INTO user (id, username, password) VALUES (?1,?2,?3)')
				.bind(userId, username, hashedPassword)
				.run();

			const lucia = locals.lucia;

			const session = await lucia.createSession(userId, {});
			const sessionCookie = lucia.createSessionCookie(session.id);
			cookies.set(sessionCookie.name, sessionCookie.value, {
				path: '.',
				...sessionCookie.attributes
			});
		} catch (e) {
			if (e instanceof Error && e.message === 'D1_ERROR: UNIQUE constraint failed: user.username') {
				return fail(400, {
					message: 'Username already used'
				});
			}

			return fail(500, {
				message: 'An unknown error occurred'
			});
		}
		return redirect(302, '/');
	}
};
