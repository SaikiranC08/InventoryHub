import { useMutation } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';

export const useLoginMutation = () => {
  return useMutation({
    mutationFn: (credentials) => authService.login(credentials),
  });
};

export const useRegisterMutation = () => {
  return useMutation({
    mutationFn: (payload) => authService.signup(payload),
  });
};
