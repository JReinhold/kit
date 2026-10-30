import { query_map } from '../../client.js';
import { on_remote_reset } from '#internal/remote-env';
import { CacheController } from '../cache.svelte.js';

export const cache = new CacheController(query_map);

on_remote_reset(cache.clear);
