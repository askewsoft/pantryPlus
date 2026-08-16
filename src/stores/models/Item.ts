import { t, flow } from 'mobx-state-tree';
import { api } from '@/api';
import { Item } from 'pantryplus-api-client/v2';

export const ItemModel = t.model('ItemModel', {
    id: t.identifier,
    name: t.string,
    upc: t.maybe(t.string),
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
    /**
     * Find-or-create on the server. Returns the canonical item (id may differ from self.id).
     */
    saveItem: flow(function*(xAuthUser: string): Generator<any, Item | null, any> {
        try {
            const saved: Item | null = yield api.item.createItem({
                item: { name: self.name, upc: self.upc ?? '', id: self.id },
                xAuthUser,
            });
            return saved;
        } catch (error) {
            console.error(`Error creating item with name: ${self.name} and upc: ${self.upc} with error: ${error}`);
            return null;
        }
    }),
    setIsChecked: (isChecked: boolean) => {
        self.isChecked = isChecked;
    }
}));
