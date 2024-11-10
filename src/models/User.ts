import { t } from 'mobx-state-tree';
import { fetchUserAttributes, FetchUserAttributesOutput } from "aws-amplify/auth";

type FetchUserAttributesType = typeof fetchUserAttributes;

export const UserModel = t
    .model("UserModel",{
        email: t.optional(t.string, ''),
        sub: t.optional(t.string, ''),
        nickname: t.optional(t.string, ''),
    })
    .actions(self => ({
        getUser: function* getUser() {
            function* transformUserAttributes(fetchUserAttributes: FetchUserAttributesType) {
                self = yield fetchUserAttributes;
            };
            if (self.email && self.sub && self.nickname) {
                yield self;
            } else {
                console.log('fetching user attributes');
                try {
                  self = yield transformUserAttributes(fetchUserAttributes);
                } catch (error) {
                  console.warn('Unable to fetch user attributes:', error);
                }
            }
        }
    }));