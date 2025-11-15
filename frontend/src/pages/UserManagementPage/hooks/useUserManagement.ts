import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import userService from '@services/user.service';
import type { User } from '../types';

export const useUserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await userService.getAll();
      setUsers(data);
    } catch (error: any) {
      console.error('Error loading users:', error);
      toast.error(error?.message || 'Không thể tải danh sách người dùng');
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  return {
    users,
    isLoading,
    reloadUsers: loadUsers,
  };
};

