import { requireOptionalNativeModule } from 'expo';

export const PANTRY_INTENTS_APP_GROUP_ID = 'group.com.askewsoft.pantryplus';

export type IntentSessionPayload = {
  accessToken: string;
  email: string;
  apiBaseUrl: string;
};

export type IntentCategorySnapshot = {
  id: string;
  name: string;
};

export type IntentListSnapshot = {
  id: string;
  name: string;
  groupId: string | null;
  categories: IntentCategorySnapshot[];
};

export type IntentRosterItem = {
  id: string;
  name: string;
  categoryId?: string | null;
  categoryName?: string | null;
};

export type IntentTypeaheadEntry = {
  id: string;
  name: string;
  aliases: string[];
  upc?: string;
};

export type IntentCachePayload = {
  lists: IntentListSnapshot[];
  rosters: Record<string, IntentRosterItem[]>;
  typeaheadCorpus: IntentTypeaheadEntry[];
  lastUsedListId: string | null;
};

type PantryIntentsNativeModule = {
  syncIntentSession(accessToken: string, email: string, apiBaseUrl: string): Promise<void>;
  clearIntentSession(): Promise<void>;
  syncIntentCache(json: string): Promise<void>;
};

const native = requireOptionalNativeModule<PantryIntentsNativeModule>('PantryIntents');

export async function syncIntentSession(session: IntentSessionPayload): Promise<void> {
  if (!native) return;
  await native.syncIntentSession(session.accessToken, session.email, session.apiBaseUrl);
}

export async function clearIntentSession(): Promise<void> {
  if (!native) return;
  await native.clearIntentSession();
}

export async function syncIntentCache(cache: IntentCachePayload): Promise<void> {
  if (!native) return;
  await native.syncIntentCache(JSON.stringify(cache));
}
