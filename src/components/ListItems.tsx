import { observer } from 'mobx-react-lite';

import { domainStore } from '@/stores/DomainStore';
import ItemsList from './ItemsList';
import { FnReturnVoid } from '@/types/FunctionArgumentTypes';

const ListItems = ({ listId }: { listId: string }) => {
  const currList = domainStore.lists.find((list) => list.id === listId);

  return (
    <ItemsList
      items={currList?.items ?? []}
      listId={listId}
      onDragEnd={currList?.updateItemOrder}
      indent={10}
    />
  );
};

export default observer(ListItems);