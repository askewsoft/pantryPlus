import { ScrollView, Text, StyleSheet, View } from 'react-native';
import { observer } from 'mobx-react-lite';

import colors from '@/consts/colors';
import fonts from '@/consts/fonts';

type PhraseGroup = {
  title: string;
  tip?: string;
  phrases: string[];
};

const PHRASE_GROUPS: PhraseGroup[] = [
  {
    title: 'One-time setup',
    tip: 'If Siri offers the App Store or says it can’t find the app, enable shortcuts first.',
    phrases: [
      'Turn on Pantry Plus shortcuts',
      'Enable Pantry Plus shortcuts',
    ],
  },
  {
    title: 'Add an item',
    tip: 'Apple’s App Shortcut phrases can only lock onto your list name (not the product). Siri will usually ask “What item?” next — answer with the product name. List titles do not include the word “list”; say it after the name. “Pantry” works as a short app name.',
    phrases: [
      'Add an item to Home Improvement list with Pantry',
      'Add something to Grocery list in Pantry Plus',
      'Put something on Home Improvement list with Pantry',
    ],
  },
  {
    title: 'Check the list',
    tip: 'Same pattern: start the check, then say the item when Siri asks.',
    phrases: [
      'Is an item on Grocery list with Pantry',
      'Check Home Improvement list in Pantry Plus',
    ],
  },
  {
    title: 'Purchase (check off)',
    tip: 'Pick a store in the app first (within about 30 minutes), or Siri will ask which store. Expect a follow-up for the item name.',
    phrases: [
      'I bought something with Pantry',
      'Purchase an item from Grocery list with Pantry',
    ],
  },
  {
    title: 'Remove (no purchase)',
    tip: 'Expect a follow-up for the item name.',
    phrases: [
      'Remove an item from Grocery list with Pantry',
      'Remove something from Home Improvement list in Pantry Plus',
    ],
  },
  {
    title: 'Move category',
    tip: 'Phrase may bind the category or the list; Siri will ask for the item (and any missing piece).',
    phrases: [
      'Move an item to Hardware with Pantry',
      'Move something on Grocery list with Pantry',
    ],
  },
];

const SiriTips = () => {
  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <Text style={styles.intro}>
        First time: say “Hey Siri, turn on Pantry Plus shortcuts” (or enable Siri for
        Pantry Plus in the Shortcuts app). Voice triggers come from App Shortcuts, which
        Apple limits to one list/category parameter — not free-text item names. End with
        “with Pantry” (or “Pantry Plus”). When Siri asks “What item?”, say the product
        name. In the Shortcuts app you can also type the item in the form UI.
      </Text>

      {PHRASE_GROUPS.map((group) => (
        <View key={group.title} style={styles.section}>
          <Text style={styles.sectionTitle}>{group.title}</Text>
          {group.tip ? <Text style={styles.tip}>{group.tip}</Text> : null}
          {group.phrases.map((phrase) => (
            <View key={phrase} style={styles.phraseCard}>
              <Text style={styles.phraseText}>“{phrase}”</Text>
            </View>
          ))}
        </View>
      ))}

      <Text style={styles.footer}>
        HomePod: turn on Recognize My Voice and Personal Requests, keep your iPhone
        on the same Wi‑Fi, and open Pantry Plus once while signed in so lists sync.
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    paddingTop: 20,
    paddingHorizontal: 10,
    paddingBottom: 40,
  },
  intro: {
    fontSize: fonts.messageTextSize,
    color: colors.lightBrandColor,
    marginBottom: 16,
    marginHorizontal: 5,
    lineHeight: 22,
  },
  section: {
    width: '100%',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: fonts.rowTextSize,
    fontWeight: 'bold',
    color: colors.lightBrandColor,
    marginBottom: 6,
    marginHorizontal: 5,
  },
  tip: {
    fontSize: fonts.badgeTextSize,
    fontStyle: 'italic',
    color: colors.lightBrandColor,
    opacity: 0.9,
    marginBottom: 8,
    marginHorizontal: 5,
    lineHeight: 18,
  },
  phraseCard: {
    backgroundColor: colors.detailsBackground,
    borderWidth: 1,
    borderColor: colors.inactiveButtonColor,
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginVertical: 4,
    marginHorizontal: 5,
  },
  phraseText: {
    fontSize: fonts.messageTextSize,
    color: colors.lightBrandColor,
    lineHeight: 20,
  },
  footer: {
    fontSize: fonts.badgeTextSize,
    color: colors.lightBrandColor,
    opacity: 0.85,
    marginTop: 8,
    marginHorizontal: 5,
    lineHeight: 18,
  },
});

export default observer(SiriTips);
