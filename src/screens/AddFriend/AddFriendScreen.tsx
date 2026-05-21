import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Input, Button, Toast, List } from '@ant-design/react-native';
import { Colors, Spacing, FontSize, BorderRadius } from '../../theme';
import { api } from '../../services/api';
import { useAppContext } from '../../context/AppContext';
import Avatar from '../../components/Avatar';

interface SearchResult {
  id: string;
  name: string;
  avatar: string;
  phone: string;
}

export default function AddFriendScreen() {
  const { state, fetchUsers } = useAppContext();
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);

  const handleSearch = useCallback(async () => {
    const q = keyword.trim();
    if (!q) return;
    setSearching(true);
    try {
      const res = await api.searchUsers(q);
      const filtered = res.filter(u => u.id !== state.currentUser?.id);
      setResults(filtered);
      if (filtered.length === 0) {
        Toast.info({ content: '未找到相关用户', duration: 1.5 });
      }
    } catch (e: any) {
      Toast.fail({ content: e.message || '搜索失败', duration: 2 });
    } finally {
      setSearching(false);
    }
  }, [keyword, state.currentUser]);

  const handleAdd = useCallback(
    async (userId: string) => {
      setAddingId(userId);
      try {
        await api.addContact(userId);
        Toast.success({ content: '已添加为好友', duration: 1.5 });
        await fetchUsers();
      } catch (e: any) {
        if (e.message.includes('已经是好友')) {
          Toast.info({ content: '该用户已经是你的好友', duration: 1.5 });
        } else {
          Toast.fail({ content: e.message || '添加失败', duration: 2 });
        }
      } finally {
        setAddingId(null);
      }
    },
    [fetchUsers],
  );

  const isContact = useCallback(
    (userId: string) => state.users.some(u => u.id === userId),
    [state.users],
  );

  const renderItem = useCallback(
    ({ item }: { item: SearchResult }) => (
      <List.Item
        thumb={<Avatar uri={item.avatar} name={item.name} size={44} />}
        arrow=""
        extra={
          isContact(item.id) ? (
            <Text style={styles.addedText}>已添加</Text>
          ) : (
            <Button
              type="primary"
              size="small"
              onPress={() => handleAdd(item.id)}
              loading={addingId === item.id}
              style={styles.addButton}>
              添加
            </Button>
          )
        }>
        <Text style={styles.resultName}>{item.name}</Text>
        <Text style={styles.resultPhone}>{item.phone}</Text>
      </List.Item>
    ),
    [isContact, addingId, handleAdd],
  );

  const keyExtractor = useCallback((item: SearchResult) => item.id, []);

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Input
          value={keyword}
          onChangeText={setKeyword}
          placeholder="搜索手机号或昵称"
          style={styles.searchInput}
          returnKeyType="search"
          onSubmitEditing={handleSearch}
          clearButtonMode="while-editing"
        />
        <Button
          type="primary"
          onPress={handleSearch}
          loading={searching}
          style={styles.searchButton}>
          搜索
        </Button>
      </View>

      {results.length > 0 ? (
        <FlatList
          data={results}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>
            {keyword ? '点击搜索按钮查找用户' : '输入手机号或昵称搜索好友'}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.divider,
  },
  searchInput: {
    flex: 1,
  },
  searchButton: {
    marginLeft: Spacing.sm,
    height: 40,
    borderRadius: BorderRadius.round,
  },
  listContent: {
    paddingBottom: Spacing.md,
  },
  resultName: {
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  resultPhone: {
    fontSize: FontSize.sm,
    color: Colors.textHint,
    marginTop: Spacing.xs,
  },
  addButton: {
    borderRadius: BorderRadius.round,
    minWidth: 64,
    height: 32,
  },
  addedText: {
    fontSize: FontSize.md,
    color: Colors.success,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxl,
  },
  emptyText: {
    fontSize: FontSize.md,
    color: Colors.textHint,
    textAlign: 'center',
  },
});
