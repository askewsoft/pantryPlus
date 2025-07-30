# Percy Screen Testing Guide

## Screen Inventory for Visual Testing

This document lists all screens in pantryPlus that need `data-testid` attributes for proper visual testing with Percy.

## Main Navigation Tabs

### Lists Tab
- **MyLists** - Main lists screen
- **ShoppingList** - Individual shopping list view

### Groups Tab  
- **MyGroups** - User's groups
- **MyInvites** - Pending group invites

### Locations Tab
- **MyLocations** - User's saved locations
- **LocationDetails** - Individual location details

### Settings Tab
- **MySettings** - Main settings screen
- **Profile** - User profile management
- **Permissions** - App permissions
- **About** - App information

## Authentication Screens
- **Login** - Sign in screen
- **SignUp** - Registration screen
- **ForgotPassword** - Password reset

## Modal Screens
- **AddListModal** - Create new list
- **AddItemModal** - Add item to list
- **AddCategoryModal** - Create new category
- **AddLocationModal** - Add new location
- **AddGroupModal** - Create new group
- **ShareListModal** - Share list with others
- **ReorderCategoriesModal** - Reorder categories

## Dynamic Content Elements

### Lists
- List names
- List item counts
- List creation dates
- List sharing status

### Items
- Item names
- Item quantities
- Item prices
- Item categories
- Item locations
- Item notes

### Categories
- Category names
- Category item counts
- Category colors

### Locations
- Location names
- Location addresses
- Location distances
- Location types

### Groups
- Group names
- Group member counts
- Group member names
- Group roles

### User Data
- User names
- User emails
- User avatars
- User preferences

## Implementation Checklist

### Phase 1: Core Screens
- [ ] Add `data-testid` to all list names
- [ ] Add `data-testid` to all item names
- [ ] Add `data-testid` to all category names
- [ ] Add `data-testid` to all location names
- [ ] Add `data-testid` to all group names

### Phase 2: User Content
- [ ] Add `data-testid` to user names
- [ ] Add `data-testid` to user emails
- [ ] Add `data-testid` to timestamps
- [ ] Add `data-testid` to counts and totals

### Phase 3: Dynamic States
- [ ] Add `data-testid` to loading states
- [ ] Add `data-testid` to error states
- [ ] Add `data-testid` to empty states
- [ ] Add `data-testid` to sync status

## Example Implementation

```jsx
// List component
<Text data-testid="list-name">{list.name}</Text>
<Text data-testid="list-item-count">{list.items.length} items</Text>

// Item component  
<Text data-testid="item-name">{item.name}</Text>
<Text data-testid="item-quantity">{item.quantity}</Text>
<Text data-testid="item-category">{item.category}</Text>

// User component
<Text data-testid="user-name">{user.name}</Text>
<Text data-testid="user-email">{user.email}</Text>
```

## Percy Commands for Each Screen

```bash
# Lists
npm run percy:home                    # MyLists screen
node scripts/percy-test.js shopping-list-empty
node scripts/percy-test.js shopping-list-items

# Groups
node scripts/percy-test.js custom "My Groups Screen"
node scripts/percy-test.js custom "Group Invites Screen"

# Locations  
node scripts/percy-test.js custom "My Locations Screen"
node scripts/percy-test.js custom "Location Details Screen"

# Settings
npm run percy:settings
node scripts/percy-test.js custom "Profile Screen"
node scripts/percy-test.js custom "Permissions Screen"
node scripts/percy-test.js custom "About Screen"

# Authentication
node scripts/percy-test.js auth-login
node scripts/percy-test.js auth-signup
``` 