import assert from 'assert';
import { buildTypeaheadCorpus, searchTypeaheadCorpus } from './itemTypeahead';

const milkId = 'milk-id';

{
  const corpus = buildTypeaheadCorpus([
    { id: milkId, name: 'Milk' },
    { id: milkId, name: '1 milk' },
  ]);
  assert.strictEqual(corpus.length, 1);
  assert.strictEqual(corpus[0].name, 'Milk');
  assert.deepStrictEqual(corpus[0].aliases, ['1 milk']);
}

{
  const dairyId = 'dairy-id';
  const corpus = buildTypeaheadCorpus([
    { id: milkId, name: 'Milk', categoryId: dairyId },
    { id: milkId, name: '1 milk' },
  ]);
  assert.strictEqual(corpus.length, 1);
  assert.strictEqual(corpus[0].categoryId, dairyId);
}

{
  const corpus = buildTypeaheadCorpus(
    [
      { id: milkId, name: 'Milk' },
      { id: milkId, name: '1 milk' },
    ],
    [{ id: milkId, name: 'Whole Milk' }],
  );
  assert.strictEqual(corpus[0].name, 'Whole Milk');
  assert.ok(corpus[0].aliases.includes('Milk'));
  assert.ok(corpus[0].aliases.includes('1 milk'));
}

{
  const corpus = buildTypeaheadCorpus([
    { id: milkId, name: 'Milk' },
    { id: milkId, name: '1 milk' },
  ]);
  const hits = searchTypeaheadCorpus(corpus, '1 mil');
  assert.ok(hits.length >= 1);
  assert.strictEqual(hits[0].entry.name, 'Milk');
  assert.strictEqual(hits[0].matchedAlias, '1 milk');
}

console.log('itemTypeahead tests passed');
