import Registry from './Registry.js';
import {BaseStore} from './BaseStore.js';
import LruStore from './lru-store.js';
import { getLogger } from './logger.js';

const logger = getLogger('corkAppUtils.clearCache');

/**
 * @description Clears model LruStore caches in models.
 * @param {Object} opts
 * @param {Array<{model: string, store?: string}>} opts.target - explicit list of
 *   model/store pairs to clear. If `store` is omitted, all stores in the model are cleared.
 *   If target is omitted entirely, all LruStores in all models will be cleared.
 * @param {Array<string>} opts.skipModels - model names to skip (only used when `target` is not set)
 * @param {Array<string>} opts.skipStores - store names to skip (only used when `target` is not set)
 */
export default function clearCache(opts={}){

  if ( opts.target?.length ) {

    logger.info('Clearing cache for targeted models/stores', opts.target);
    for (const { model: modelName, store: storeName } of opts.target) {
      const model = Registry.models[modelName];
      if ( !model ) {
        logger.debug(`Model not found: ${modelName}`);
        continue;
      }
      if ( !model?.store || !(model.store instanceof BaseStore) ) {
        logger.debug(`No store found for model: ${modelName}`);
        continue;
      }
      if ( typeof model.store.data !== 'object' ) {
        logger.debug(`No data object found for model: ${modelName}`);
        continue;
      }
      for (const storeKey in model.store.data) {
        const store = model.store.data[storeKey];
        if ( !(store instanceof LruStore) ) {
          logger.debug(`Store ${storeKey} is not LruStore, skipping`);
          continue;
        }
        if ( storeName && store.name !== storeName  ) continue;
        
        store.purge();
        logger.debug(`Cleared LruStore: ${store.name} in ${modelName}`);
      }
    }
    return;
  }

  logger.info('Clearing cache for all LruStores');

  for (const modelName in Registry.models) {

    if ( opts.skipModels?.includes(modelName) ) {
      logger.debug(`Skipping model: ${modelName}`);
      continue;
    }

    logger.debug(`Clearing cache for model: ${modelName}`);

    const model = Registry.models[modelName];
    
    // bail if model.store is not BaseStore or subclass
    if ( !model.store || !(model.store instanceof BaseStore) ) {
      logger.debug(`No store found for model: ${modelName}`);
      continue;
    }

    // bail if model.store.data is not an object
    if ( typeof model.store.data !== 'object' ) {
      logger.debug(`No data object found for model: ${modelName}`);
      continue;
    }

    for (const storeKey in model.store.data) {
      const store = model.store.data[storeKey];
      
      // only clear LruStore instances
      if ( !(store instanceof LruStore) ) {
        logger.debug(`Store ${storeKey} is not LruStore, skipping`);
        continue;
      }

      if ( opts.skipStores?.includes(store.name) ) {
        logger.debug(`Skipping store: ${store.name}`);
        continue;
      }

      store.purge();
      logger.debug(`Cleared LruStore: ${store.name}`);
    }
  }

}