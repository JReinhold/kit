import { live_query_map } from '../../client.js';
import { on_remote_reset } from '#internal/remote-env';
import { CacheController } from '../cache.svelte.js';

export const cache = new CacheController(live_query_map, (resource) => resource.destroy());

on_remote_reset(cache.clear);
