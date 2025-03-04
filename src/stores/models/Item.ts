import { t, flow } from 'mobx-state-tree';
import { api } from '@/api';

export const ItemModel = t.model('ItemModel', {
    id: t.identifier,
    name: t.string,
    upc: t.maybe(t.string),
    ordinal: t.maybe(t.number),
    isChecked: t.optional(t.boolean, false)
}).actions(self => ({
    setName: flow(function*(name: string, xAuthUser: string): Generator<any, any, any> {
        try {
            yield api.item.updateItem({ item: { name, upc: self.upc || '', id: self.id }, xAuthUser });
            self.name = name;
        } catch (error) {
            console.error(`Error setting item name for itemId: ${self.id} to name: ${name} with error: ${error}`);
        }
    }),
    saveItem: flow(function*(xAuthUser: string): Generator<any, any, any> {
        try {
            yield api.item.createItem({ item: { name: self.name, upc: self.upc ?? '', id: self.id }, xAuthUser });
        } catch (error) {
            console.error(`Error creating item with name: ${self.name} and upc: ${self.upc} with error: ${error}`);
        }
    }),
    setOrdinal: (ordinal: number) => {
        self.ordinal = ordinal;
    },
    setIsChecked: (isChecked: boolean) => {
        self.isChecked = isChecked;
    }
}));