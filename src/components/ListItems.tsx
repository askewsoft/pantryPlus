import { observer } from 'mobx-react-lite';

import { domainStore } from '@/stores/DomainStore';
import ItemsList from './ItemsList';

const ListItems = ({ listId }: { listId: string }) => {
  const currList = domainStore.lists.find((list) => list.id === listId);

  return (
    <ItemsList
      items={currList?.items ?? []}
      listId={listId}
      indent={10}
    />
  );
};

export default observer(ListItems);