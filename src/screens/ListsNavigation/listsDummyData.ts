import { ListType } from '@/stores/DomainStore';

export const listsDummyData: ListType[] = [
  {
    id: '1',
    name: 'Groceries',
    userIsOwner: true,
    groupId: undefined,
    categories: undefined
  },
  {
    id: '2',
    name: 'Household Supplies',
    userIsOwner: false,
    groupId: undefined,
    categories: undefined
  },
  {
    id: '3',
    name: 'Home Improvement',
    userIsOwner: false,
    groupId: undefined,
    categories: undefined
  }
];