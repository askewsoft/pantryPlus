# TestID Implementation Guide for Visual Testing

This guide helps you add appropriate `testID` attributes to data-driven components in pantryPlus to ensure reliable visual regression testing.

## Why TestIDs Matter

React Native Owl uses `testID` attributes to:
- **Target specific elements** for screenshot capture
- **Ignore dynamic content** during visual comparison
- **Ensure consistent testing** across different data states

## Simple Approach: Use `owl-ignore` for Dynamic Content

For all data-driven elements that should be ignored during visual comparison, use a single testID:

```jsx
<Text testID="owl-ignore">{user?.nickname}</Text>
<Text testID="owl-ignore">{list?.name}</Text>
<Badge testID="owl-ignore" count={unpurchasedItemsCount} />
```

This approach is:
- **Simple**: One testID for all dynamic content
- **Clear**: Easy to understand what will be ignored
- **Maintainable**: No need to maintain a long list of patterns
- **Consistent**: Same pattern across all components

## Component-Specific Recommendations

### 1. ListElement Component (`src/components/ListElement.tsx`)

```jsx
// Add owl-ignore to dynamic content:
<Text style={styles.title} testID="owl-ignore">{list?.name}</Text>
<Badge count={unpurchasedItemsCount} size="small" testID="owl-ignore" />
```

### 2. Item Component (`src/components/Item.tsx`)

```jsx
// Add owl-ignore to dynamic content:
<Text style={styles.item} testID="owl-ignore">{item.name}</Text>
<CheckBoxButton 
  isChecked={item.isChecked} 
  onPress={onPress}
  testID="owl-ignore"
/>
```

### 3. Badge Component (`src/components/Badge.tsx`)

```jsx
// Add testID prop support:
interface BadgeProps {
  count: number;
  size?: 'small' | 'medium' | 'large';
  testID?: string; // Add this
}

// Use in component:
<View style={[styles.container, currentSize.container]} testID={testID}>
  <Text style={[styles.text, currentSize.text]} testID={`${testID}-text`}>
    {count > 99 ? '99+' : count.toString()}
  </Text>
</View>
```

### 4. Profile Screen (`src/screens/SettingsNavigation/Profile.tsx`)

```jsx
// Add owl-ignore to user data:
<Text style={sharedStyles.value} testID="owl-ignore">
  {user?.nickname}
</Text>
<Text style={sharedStyles.value} testID="owl-ignore">
  {user?.email}
</Text>
```

### 5. MyGroups Screen (`src/screens/GroupsNavigation/MyGroups.tsx`)

```jsx
// Add owl-ignore to dynamic content:
<Text style={styles.badgeText} testID="owl-ignore">
  Awaiting Invites: {numInvites}
</Text>
```

### 6. LocationElement Component (`src/components/LocationElement.tsx`)

```jsx
// Add owl-ignore to dynamic content:
<Text style={styles.title} testID="owl-ignore">
  {location?.name ?? ''}
</Text>
<Text style={styles.lastPurchaseDate} testID="owl-ignore">
  most recent: {formatAsDate(location?.lastPurchaseDate!)}
</Text>
```

### 7. ShoppingList Screen (`src/screens/ListsNavigation/ShoppingList.tsx`)

```jsx
// Add owl-ignore to navigation title:
useEffect(() => {
  if (currentList && currentList.name) {
    navigation.setOptions({ 
      title: currentList.name,
      // Add testID to navigation header
      headerTitle: () => (
        <Text testID="owl-ignore">{currentList.name}</Text>
      )
    });
  }
}, [currentList?.name]);
```

## Screen-Level TestIDs

Add these testIDs to your main screen containers for targeting specific screens:

```jsx
// MyLists screen
<View style={styles.container} testID="my-lists-screen">
  {/* content */}
</View>

// ShoppingList screen  
<View style={styles.container} testID="shopping-list-screen">
  {/* content */}
</View>

// MyGroups screen
<View style={styles.container} testID="my-groups-screen">
  {/* content */}
</View>

// Profile screen
<View style={sharedStyles.container} testID="profile-screen">
  {/* content */}
</View>
```

## Dynamic Content Patterns

### Lists and Arrays
```jsx
// For dynamic lists, use owl-ignore for content
{items.map((item, index) => (
  <Item 
    key={item.id}
    item={item}
    testID="owl-ignore" // Ignore dynamic item content
  />
))}
```

### Conditional Content
```jsx
// For conditional elements
{isLoading && (
  <View testID="owl-ignore">
    <ActivityIndicator />
  </View>
)}

{error && (
  <Text testID="owl-ignore">{error}</Text>
)}
```

### Count Badges
```jsx
// For count displays
<Badge 
  count={unpurchasedItemsCount} 
  testID="owl-ignore"
/>

<Text testID="owl-ignore">{items.length} items</Text>
```

## Implementation Priority

### High Priority (Add First)
1. **List names** - `testID="owl-ignore"`
2. **Item names** - `testID="owl-ignore"`
3. **User data** - `testID="owl-ignore"`
4. **Count badges** - `testID="owl-ignore"`
5. **Screen containers** - `testID="my-lists-screen"` (for targeting)

### Medium Priority
1. **Category names** - `testID="owl-ignore"`
2. **Location names** - `testID="owl-ignore"`
3. **Group names** - `testID="owl-ignore"`
4. **Navigation titles** - `testID="owl-ignore"`

### Low Priority
1. **Status indicators** - `testID="owl-ignore"`
2. **Timestamps** - `testID="owl-ignore"`
3. **Generic containers** - `testID="owl-ignore"`

## Testing Your TestIDs

After adding testIDs:

1. **Run visual testing**: `npm run owl`
2. **Check for ignored elements**: Verify dynamic content is properly ignored
3. **Review screenshots**: Ensure static UI elements are captured correctly
4. **Update baseline**: If changes are intentional

## Common Pitfalls

### ❌ Don't Use Dynamic Values in testID
```jsx
// Bad - will change with data
<Text testID={`item-${item.name}`}>Item</Text>

// Good - use owl-ignore for dynamic content
<Text testID="owl-ignore">{item.name}</Text>
```

### ❌ Don't Mix Specific and Generic testIDs
```jsx
// Bad - inconsistent approach
<Text testID="list-name">{list.name}</Text>
<Text testID="owl-ignore">{user.name}</Text>

// Good - consistent owl-ignore for all dynamic content
<Text testID="owl-ignore">{list.name}</Text>
<Text testID="owl-ignore">{user.name}</Text>
```

### ✅ Use Consistent Patterns
```jsx
// Consistent owl-ignore for all dynamic content
<Text testID="owl-ignore">{list.name}</Text>
<Text testID="owl-ignore">{category.name}</Text>
<Text testID="owl-ignore">{item.name}</Text>

// Use specific testIDs only for targeting (not ignoring)
<View testID="my-lists-screen">
  {/* content */}
</View>
```

## Next Steps

1. **Start with high-priority components** (ListElement, Item, Profile)
2. **Add screen-level testIDs** for main navigation screens
3. **Test with React Native Owl** to verify ignored elements work correctly
4. **Update baseline screenshots** after adding testIDs
5. **Document any new patterns** you discover

## Resources

- [React Native Owl Documentation](https://github.com/FormidableLabs/react-native-owl)
- [React Native testID Documentation](https://reactnative.dev/docs/testid)
- [Visual Testing Best Practices](OWL_VISUAL_TESTING.md) 