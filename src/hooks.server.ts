import type { Handle } from '@sveltejs/kit';

const BASIC_AUTH_USER = 'samsung';
const BASIC_AUTH_PASS = 'gemini';

export const handle: Handle = async ({ event, resolve }) => {
	const authHeader = event.request.headers.get('authorization');

	if (!authHeader || !authHeader.startsWith('Basic ')) {
		return new Response('Unauthorized', {
			status: 401,
			headers: {
				'WWW-Authenticate': 'Basic realm="Restricted"'
			}
		});
	}

	const credentials = atob(authHeader.slice(6));
	const [user, pass] = credentials.split(':');

	if (user !== BASIC_AUTH_USER || pass !== BASIC_AUTH_PASS) {
		return new Response('Unauthorized', {
			status: 401,
			headers: {
				'WWW-Authenticate': 'Basic realm="Restricted"'
			}
		});
	}

	const response = await resolve(event);
	return response;
};
