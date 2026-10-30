/** @import { NavigationEvent } from '@sveltejs/kit' */
import * as e from '../../messages/client-errors.js';

/**
 * Everything the client remote-function runtime needs from the app it runs in.
 * `start()` installs the app's own router and transport. Code that renders
 * components without a SvelteKit app (such as a component test or a Storybook
 * story) can provide its own with `set_remote_env`.
 * @typedef {{
 *   fetch: (input: string, init?: RequestInit) => Promise<Response>;
 *   decoders: Record<string, (data: any) => any>;
 *   encoders: Record<string, (data: any) => any>;
 *   page: { readonly url: Pick<URL, 'pathname' | 'search'> };
 *   navigating: { readonly to: { readonly url: Pick<URL, 'pathname' | 'search'> } | null } | null;
 *   goto: (url: string | URL, options?: { refreshAll?: boolean }) => Promise<void>;
 *   refresh_all: () => Promise<void>;
 *   handle_error: (error: unknown, event: NavigationEvent) => Promise<App.Error>;
 *   notify_version: (version: string | null) => void;
 * }} RemoteEnv
 */

/**
 * `page`, `goto`, `refresh_all` and `handle_error` need an app,
 * so they throw until `start()` or `set_remote_env` provides them
 * @type {RemoteEnv}
 */
export const remote_env = {
	fetch: (input, init) => fetch(input, init),
	decoders: {},
	encoders: {},
	page: {
		get url() {
			return e.remote_env_missing({ name: 'page' });
		}
	},
	navigating: null,
	goto: () => e.remote_env_missing({ name: 'goto' }),
	refresh_all: () => e.remote_env_missing({ name: 'refresh_all' }),
	handle_error: () => e.remote_env_missing({ name: 'handle_error' }),
	notify_version: () => {}
};

/**
 * @param {Partial<RemoteEnv>} env
 */
export function set_remote_env(env) {
	Object.assign(remote_env, env);
}

/** @type {Set<() => void | Promise<void>>} */
const resetters = new Set();

/**
 * Counts the calls of `reset_remote_state`. An operation reads it when it starts and
 * skips its effects on shared state if a reset happened while it was in flight
 */
export let reset_generation = 0;

/**
 * Registers a callback that clears module-level remote-function state
 * when `reset_remote_state` is called. Call it once per module, not per instance
 * @param {() => void | Promise<void>} callback
 */
export function on_remote_reset(callback) {
	resetters.add(callback);
}

/**
 * Clears every cached query, live query and prerender result and the state of
 * every form, so that the next component starts from scratch. For code that
 * renders many components in one page, such as a test runner
 * @returns {Promise<void>}
 */
export async function reset_remote_state() {
	reset_generation++;
	await Promise.all(Array.from(resetters, (reset) => Promise.resolve(reset())));
}
