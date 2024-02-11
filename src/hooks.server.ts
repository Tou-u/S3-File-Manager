import { dev } from '$app/environment';
import { initializeLucia } from '$lib/auth';
import type { Handle } from '@sveltejs/kit';
import { D1Database$ } from 'cfw-bindings-wrangler-bridge';

const getDevD1 = async (dbName: string) => {
	return new D1Database$(dbName);
};

export const handle: Handle = async ({ event, resolve }) => {
	if (dev) {
		event.locals.db = await getDevD1('DB');
	} else {
		event.locals.db = event.platform?.env.DB;
	}

	event.locals.lucia = initializeLucia(event.locals.db);

	const lucia = event.locals.lucia;
	const sessionId = event.cookies.get(lucia.sessionCookieName);

	if (!sessionId) {
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

	const { session, user } = await lucia.validateSession(sessionId);
	if (session && session.fresh) {
		const sessionCookie = lucia.createSessionCookie(session.id);
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});
	}

	if (!session) {
		const sessionCookie = lucia.createBlankSessionCookie();
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});
	}
	event.locals.user = user as { username: string; id: string };
	event.locals.session = session;

	return resolve(event);
};
