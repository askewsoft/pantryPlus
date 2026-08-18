import { AppState, Platform } from 'react-native';
import { Hub } from 'aws-amplify/utils';
import { fetchAuthSession, fetchUserAttributes } from 'aws-amplify/auth';

import appConfig from '@/config/app';
import { api } from '@/api';
import { buildTypeaheadCorpus, TypeaheadEntry } from '@/utils/itemTypeahead';
import {
  clearIntentSession,
  IntentCachePayload,
  IntentRosterItem,
  IntentTypeaheadEntry,
  syncIntentCache,
  syncIntentSession,
} from 'pantry-intents';

const TYPEAHEAD_LOOKBACK_DAYS = 365;
const CACHE_DEBOUNCE_MS = 300;

let latestCorpus: IntentTypeaheadEntry[] = [];
let cacheTimer: ReturnType<typeof setTimeout> | null = null;

export function setIntentTypeaheadCorpus(corpus: TypeaheadEntry[]) {
  latestCorpus = corpus.map((entry) => ({
    id: entry.id,
    name: entry.name,
    aliases: entry.aliases,
    upc: entry.upc,
  }));
  scheduleIntentCacheSync();
}

export function scheduleIntentCacheSync() {
  if (Platform.OS !== 'ios') return;
  if (cacheTimer) clearTimeout(cacheTimer);
  cacheTimer = setTimeout(() => {
    cacheTimer = null;
    void flushIntentCache();
  }, CACHE_DEBOUNCE_MS);
}

async function flushIntentCache() {
  try {
    const { domainStore } = require('@/stores/DomainStore') as typeof import('@/stores/DomainStore');
    const { uiStore } = require('@/stores/UIStore') as typeof import('@/stores/UIStore');

    const lists = domainStore.lists.map((list) => ({
      id: list.id,
      name: list.name,
      groupId: list.groupId ?? null,
      categories: list.categories.map((category) => ({
        id: category.id,
        name: category.name,
      })),
    }));

    const rosters: IntentCachePayload['rosters'] = {};
    for (const list of domainStore.lists) {
      rosters[list.id] = snapshotRoster(list);
    }

    const payload: IntentCachePayload = {
      lists,
      rosters,
      typeaheadCorpus: latestCorpus,
      lastUsedListId: uiStore.selectedShoppingList,
    };
    await syncIntentCache(payload);
  } catch (error) {
    console.error('Failed to sync Siri intent cache:', error);
  }
}

function snapshotRoster(list: {
  items: Array<{ id: string; name: string }>;
  categories: Array<{ id: string; name: string; items: Array<{ id: string; name: string }> }>;
}): IntentRosterItem[] {
  const items: IntentRosterItem[] = [];
  for (const category of list.categories) {
    for (const item of category.items) {
      items.push({
        id: item.id,
        name: item.name,
        categoryId: category.id,
        categoryName: category.name,
      });
    }
  }
  for (const item of list.items) {
    items.push({
      id: item.id,
      name: item.name,
      categoryId: null,
      categoryName: null,
    });
  }
  return items;
}

export async function refreshTypeaheadCorpusForSiri() {
  if (Platform.OS !== 'ios') return;
  try {
    const { domainStore } = require('@/stores/DomainStore') as typeof import('@/stores/DomainStore');
    const { uiStore } = require('@/stores/UIStore') as typeof import('@/stores/UIStore');
    const user = domainStore.user;
    const currentList =
      domainStore.lists.find((list) => list.id === uiStore.selectedShoppingList) ?? domainStore.lists[0];
    if (!user || !currentList) return;

    const cohortId = currentList.groupId ?? null;
    const householdLists = [
      currentList,
      ...domainStore.lists.filter((list) => {
        if (list.id === currentList.id) return false;
        if (cohortId) return list.groupId === cohortId;
        return list.groupId == null && list.ownerId === currentList.ownerId;
      }),
    ];
    const items = await api.shopper.getPurchasedItems({
      user,
      lookBackDays: TYPEAHEAD_LOOKBACK_DAYS,
      cohortId,
    });
    const preferredNames = householdLists.flatMap((list) => [
      ...list.items.map((item) => ({ id: item.id, name: item.name })),
      ...list.categories.flatMap((category) =>
        category.items.map((item) => ({ id: item.id, name: item.name })),
      ),
    ]);
    setIntentTypeaheadCorpus(buildTypeaheadCorpus(items, preferredNames));
  } catch (error) {
    console.error('Failed to refresh Siri typeahead corpus:', error);
  }
}

export async function syncIntentSessionFromAmplify() {
  if (Platform.OS !== 'ios') return;
  try {
    const session = await fetchAuthSession();
    const accessToken = session.tokens?.accessToken?.toString();
    if (!accessToken) {
      await clearIntentSession();
      return;
    }

    const idEmail = session.tokens?.idToken?.payload?.email;
    let email = typeof idEmail === 'string' ? idEmail : '';
    if (!email) {
      const attributes = await fetchUserAttributes();
      email = attributes.email ?? '';
    }
    if (!email) return;

    await syncIntentSession({
      accessToken,
      email,
      apiBaseUrl: appConfig.apiUrl,
    });
  } catch (error) {
    console.error('Failed to sync Siri intent session:', error);
  }
}

export async function clearIntentSessionAndCache() {
  if (Platform.OS !== 'ios') return;
  latestCorpus = [];
  try {
    await clearIntentSession();
  } catch (error) {
    console.error('Failed to clear Siri intent session:', error);
  }
}

export function startIntentSessionListeners(): () => void {
  if (Platform.OS !== 'ios') return () => {};

  const stopHub = Hub.listen('auth', ({ payload }) => {
    switch (payload.event) {
      case 'signedIn':
      case 'tokenRefresh':
        void syncIntentSessionFromAmplify();
        break;
      case 'signedOut':
      case 'tokenRefresh_failure':
        void clearIntentSessionAndCache();
        break;
      default:
        break;
    }
  });

  const appState = AppState.addEventListener('change', (nextState) => {
    if (nextState === 'active') {
      void syncIntentSessionFromAmplify();
    }
  });

  void syncIntentSessionFromAmplify();

  return () => {
    stopHub();
    appState.remove();
  };
}
