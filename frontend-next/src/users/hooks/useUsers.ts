import { useState, useEffect, useCallback } from 'react';
import { userService } from '@features/users/services/user.service';
import type {
  User,
  UserFilters,
  CreateUserInput,
  UpdateUserInput,
} from '@/types/user';
import { getSocket } from '@lib/socket.service';

interface UseUsersOptions {
  page?: number;
  limit?: number;
}

export const useUsers = (options: UseUsersOptions = {}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState<UserFilters>({
    page: options.page || 1,
    limit: options.limit || 10,
  });

  // Listen for user updates via Socket.io
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleUserUpdated = (data: {
      user: User;
      action: 'created' | 'updated' | 'deleted' | 'toggled';
    }) => {
      if (data.action === 'deleted') {
        setUsers((prev) => prev.filter((u) => u.id !== data.user.id));
        if (selectedUser?.id === data.user.id) {
          setSelectedUser(null);
        }
      } else if (data.action === 'created') {
        setUsers((prev) => [data.user, ...prev]);
      } else {
        // updated or toggled
        setUsers((prev) =>
          prev.map((u) => (u.id === data.user.id ? data.user : u))
        );
        if (selectedUser?.id === data.user.id) {
          setSelectedUser(data.user);
        }
      }
    };

    const subscribeToDashboard = () => {
      if (socket.connected) {
        socket.emit('subscribe_dashboard');
      } else {
        socket.once('connect', () => {
          socket.emit('subscribe_dashboard');
        });
      }
    };

    subscribeToDashboard();
    socket.on('user_updated', handleUserUpdated);

    return () => {
      socket.off('user_updated', handleUserUpdated);
    };
  }, [selectedUser]);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await userService.getAll(filters);
      setUsers(response.users);
      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải danh sách người dùng');
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const loadUserDetail = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const user = await userService.getById(id);
      setSelectedUser(user);
      return user;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải thông tin người dùng');
      setSelectedUser(null);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createUser = useCallback(async (data: CreateUserInput): Promise<User> => {
    setIsLoading(true);
    setError(null);
    try {
      const user = await userService.create(data);
      // Socket event will update the list automatically
      await loadUsers();
      return user;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể tạo người dùng';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [loadUsers]);

  const updateUser = useCallback(async (id: string, data: UpdateUserInput): Promise<User> => {
    setIsLoading(true);
    setError(null);
    try {
      const user = await userService.update(id, data);
      // Socket event will update the list automatically
      await loadUsers();
      if (selectedUser?.id === id) {
        setSelectedUser(user);
      }
      return user;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể cập nhật người dùng';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [loadUsers, selectedUser]);

  const deleteUser = useCallback(async (id: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      await userService.delete(id);
      // Socket event will update the list automatically
      await loadUsers();
      if (selectedUser?.id === id) {
        setSelectedUser(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể xóa người dùng';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [loadUsers, selectedUser]);

  const toggleActive = useCallback(async (id: string): Promise<User> => {
    setIsLoading(true);
    setError(null);
    try {
      const user = await userService.toggleActive(id);
      // Socket event will update the list automatically
      await loadUsers();
      if (selectedUser?.id === id) {
        setSelectedUser(user);
      }
      return user;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể thay đổi trạng thái người dùng';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [loadUsers, selectedUser]);

  const resetPassword = useCallback(async (id: string, newPassword: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      await userService.resetPassword(id, newPassword);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể đặt lại mật khẩu';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateFilters = useCallback((newFilters: Partial<UserFilters>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: 1, // Reset to first page when filters change
    }));
  }, []);

  const setPage = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  const setSearchQuery = useCallback((search: string) => {
    updateFilters({ search: search || undefined });
  }, [updateFilters]);

  const setRoleFilter = useCallback((role: 'ADMIN' | 'STAFF' | undefined) => {
    updateFilters({ role });
  }, [updateFilters]);

  const setIsActiveFilter = useCallback((isActive: boolean | undefined) => {
    updateFilters({ isActive });
  }, [updateFilters]);

  const clearSelectedUser = useCallback(() => {
    setSelectedUser(null);
  }, []);

  return {
    users,
    selectedUser,
    isLoading,
    error,
    pagination,
    filters,
    loadUsers,
    loadUserDetail,
    createUser,
    updateUser,
    deleteUser,
    toggleActive,
    resetPassword,
    setSearchQuery,
    setRoleFilter,
    setIsActiveFilter,
    setPage,
    clearSelectedUser,
  };
};
