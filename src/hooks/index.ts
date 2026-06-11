import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api'

export const useProfile = () =>
  useQuery({
    queryKey: ['profile'],
    queryFn: api.auth.getProfile,
  })

export const useOrders = () =>
  useQuery({
    queryKey: ['orders'],
    queryFn: api.orders.getOrders,
  })

export const useOrder = (id?: string) =>
  useQuery({
    queryKey: ['orders', id],
    queryFn: () => api.orders.getOrder(id || ''),
    enabled: Boolean(id),
  })

export const useCreateOrder = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: api.orders.createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}

export const useCarriers = () =>
  useQuery({
    queryKey: ['carriers'],
    queryFn: api.orders.getCarriers,
  })

export const usePorts = () =>
  useQuery({
    queryKey: ['ports'],
    queryFn: api.map.getPorts,
  })

export const useCheckpoints = () =>
  useQuery({
    queryKey: ['checkpoints'],
    queryFn: api.map.getCheckpoints,
  })

export const useVessels = () =>
  useQuery({
    queryKey: ['vessels'],
    queryFn: api.map.getVessels,
  })

export const useTrucks = () =>
  useQuery({
    queryKey: ['trucks'],
    queryFn: api.map.getTrucks,
  })

export const useAIAnalytics = () =>
  useQuery({
    queryKey: ['aiAnalytics'],
    queryFn: api.ai.getAnalytics,
  })

export const useGenerateRoute = () =>
  useMutation({
    mutationFn: ({ from, to }: { from: string; to: string }) => api.ai.generateRoute(from, to),
  })

export const useAIChat = () =>
  useMutation({
    mutationFn: api.ai.chat,
  })

export const useChats = () =>
  useQuery({
    queryKey: ['chats'],
    queryFn: api.chat.getChats,
  })

export const useNotifications = () =>
  useQuery({
    queryKey: ['notifications'],
    queryFn: api.notifications.getNotifications,
  })

export const useMessages = (chatId: string) =>
  useQuery({
    queryKey: ['messages', chatId],
    queryFn: () => api.chat.getMessages(chatId),
    enabled: Boolean(chatId),
  })

export const useSendMessage = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ chatId, text }: { chatId: string; text: string }) => api.chat.sendMessage(chatId, text),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.chatId] })
      queryClient.invalidateQueries({ queryKey: ['chats'] })
    },
  })
}

export const useStats = () =>
  useQuery({
    queryKey: ['stats'],
    queryFn: api.stats.getStats,
  })

export const useCharts = () =>
  useQuery({
    queryKey: ['charts'],
    queryFn: api.stats.getCharts,
  })

export const useLogin = () =>
  useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => api.auth.login(email, password),
  })

export const useRegister = () =>
  useMutation({
    mutationFn: api.auth.register,
  })

export const useForgotPassword = () =>
  useMutation({
    mutationFn: api.auth.forgotPassword,
  })

export const useBecomeCarrier = () =>
  useMutation({
    mutationFn: api.auth.becomeCarrier,
  })
