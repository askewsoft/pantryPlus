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
    tip: 'Say the list name, then the word “list” (lists are named “Grocery”, not “Grocery list”). “Pantry” works as a short name for the app.',
    phrases: [
      'Add well salt to Home Improvement list with Pantry',
      'Add well salt to Grocery list in Pantry Plus',
      'Put well salt on Home Improvement list with Pantry',
    ],
  },
  {
    title: 'Check the list',
    phrases: [
      'Is well salt on Grocery list with Pantry',
      'Is well salt on Home Improvement list in Pantry Plus',
    ],
  },
  {
    title: 'Purchase (check off)',
    tip: 'Pick a store in the app first (within about 30 minutes), or Siri will ask which store.',
    phrases: [
      'I bought well salt with Pantry',
      'Purchase well salt from Grocery list with Pantry',
    ],
  },
  {
    title: 'Remove (no purchase)',
    phrases: [
      'Remove well salt from Grocery list with Pantry',
      'Remove well salt from Home Improvement list in Pantry Plus',
    ],
  },
  {
    title: 'Move category',
    phrases: [
      'Move well salt to Hardware with Pantry',
      'Move well salt to No Category on Grocery list with Pantry',
    ],
  },
];

const SiriTips = () => {
  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <Text style={styles.intro}>
        First time: say “Hey Siri, turn on Pantry Plus shortcuts” (or enable Siri for
        Pantry Plus in the Shortcuts app). Apple requires the app name in voice
        triggers — “with Pantry” is enough (shorter than “Pantry Plus”). Include the
        item name in the same sentence so Siri does not ask “What item?” again.
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
