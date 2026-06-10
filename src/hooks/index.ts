import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api'

export const useProfile = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: api.auth.getProfile
  })
}

export const useOrders = () => {
  return useQuery({
    queryKey: ['orders'],
    queryFn: api.orders.getOrders
  })
}

export const useCreateOrder = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.orders.createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    }
  })
}

export const useCarriers = () => {
  return useQuery({
    queryKey: ['carriers'],
    queryFn: api.orders.getCarriers
  })
}

export const usePorts = () => {
  return useQuery({
    queryKey: ['ports'],
    queryFn: api.map.getPorts
  })
}

export const useCheckpoints = () => {
  return useQuery({
    queryKey: ['checkpoints'],
    queryFn: api.map.getCheckpoints
  })
}

export const useVessels = () => {
  return useQuery({
    queryKey: ['vessels'],
    queryFn: api.map.getVessels
  })
}

export const useTrucks = () => {
  return useQuery({
    queryKey: ['trucks'],
    queryFn: api.map.getTrucks
  })
}

export const useAIAnalytics = () => {
  return useQuery({
    queryKey: ['aiAnalytics'],
    queryFn: api.ai.getAnalytics
  })
}

export const useGenerateRoute = () => {
  return useMutation({
    mutationFn: ({ from, to }: { from: string; to: string }) => api.ai.generateRoute(from, to)
  })
}

export const useChats = () => {
  return useQuery({
    queryKey: ['chats'],
    queryFn: api.chat.getChats
  })
}

export const useMessages = (chatId: string) => {
  return useQuery({
    queryKey: ['messages', chatId],
    queryFn: () => api.chat.getMessages(chatId)
  })
}

export const useSendMessage = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ chatId, text }: { chatId: string; text: string }) => api.chat.sendMessage(chatId, text),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.chatId] })
    }
  })
}

export const useStats = () => {
  return useQuery({
    queryKey: ['stats'],
    queryFn: api.stats.getStats
  })
}

export const useCharts = () => {
  return useQuery({
    queryKey: ['charts'],
    queryFn: api.stats.getCharts
  })
}

export const useLogin = () => {
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => api.auth.login(email, password)
  })
}

export const useRegister = () => {
  return useMutation({
    mutationFn: api.auth.register
  })
}

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: api.auth.forgotPassword
  })
}

export const useBecomeCarrier = () => {
  return useMutation({
    mutationFn: api.auth.becomeCarrier
  })
}
