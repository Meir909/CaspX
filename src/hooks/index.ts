import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api'
import { backendApi } from '@/api/backend'

export const useProfile = () =>
  useQuery({
    queryKey: ['profile'],
    queryFn: api.auth.getProfile,
  })

export const useOrders = () =>
  useQuery({
    queryKey: ['orders'],
    queryFn: backendApi.orders.getOrders,
  })

export const useOrder = (id?: string) =>
  useQuery({
    queryKey: ['orders', id],
    queryFn: () => backendApi.orders.getOrder(id || ''),
    enabled: Boolean(id),
  })

export const useCreateOrder = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: backendApi.orders.createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}

export const useUpdateOrder = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof backendApi.orders.updateOrder>[1] }) =>
      backendApi.orders.updateOrder(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['orders', 'available'] })
      queryClient.invalidateQueries({ queryKey: ['orders', variables.id] })
    },
  })
}

export const useAssignOrder = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: backendApi.orders.assignOrder,
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['orders', 'available'] })
      queryClient.invalidateQueries({ queryKey: ['orders', order.id] })
    },
  })
}

export const useAvailableOrders = () =>
  useQuery({
    queryKey: ['orders', 'available'],
    queryFn: backendApi.orders.getAvailableOrders,
  })

export const useCarrierProfile = () =>
  useQuery({
    queryKey: ['carrier', 'profile'],
    queryFn: backendApi.carrier.getProfile,
  })

export const useCarrierVehicles = () =>
  useQuery({
    queryKey: ['carrier', 'vehicles'],
    queryFn: backendApi.vehicles.getVehicles,
  })

export const useCreateVehicle = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: backendApi.vehicles.createVehicle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carrier', 'vehicles'] })
      queryClient.invalidateQueries({ queryKey: ['carrier', 'profile'] })
    },
  })
}

export const useUpdateVehicle = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof backendApi.vehicles.updateVehicle>[1] }) =>
      backendApi.vehicles.updateVehicle(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['carrier', 'vehicles'] })
      queryClient.invalidateQueries({ queryKey: ['carrier', 'vehicles', variables.id] })
    },
  })
}

export const useUpdateCarrierProfile = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: backendApi.carrier.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carrier', 'profile'] })
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
  })
}

export const useUploadAvatar = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: backendApi.uploads.uploadAvatar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      queryClient.invalidateQueries({ queryKey: ['carrier', 'profile'] })
    },
  })
}

export const useTrackingTimeline = (orderId?: string) =>
  useQuery({
    queryKey: ['orders', orderId, 'tracking'],
    queryFn: () => backendApi.tracking.getTimeline(orderId || ''),
    enabled: Boolean(orderId),
  })

export const useCalculatedRoute = (orderId?: string) =>
  useQuery({
    queryKey: ['orders', orderId, 'route'],
    queryFn: () => backendApi.routes.calculate(orderId || ''),
    enabled: Boolean(orderId),
    retry: false,
  })

export const useCheckpointLoadsCurrent = () =>
  useQuery({
    queryKey: ['checkpoint-loads', 'current'],
    queryFn: backendApi.checkpointLoads.getCurrent,
    retry: false,
  })

export const useLandPrediction = (orderId?: string) =>
  useQuery({
    queryKey: ['predictions', 'land', orderId],
    queryFn: () => backendApi.predictions.predictLand(orderId || ''),
    enabled: Boolean(orderId),
    retry: false,
  })

export const useMarinePrediction = (
  input?:
    | {
        originLat: number
        originLng: number
        destLat: number
        destLng: number
      }
    | null,
) =>
  useQuery({
    queryKey: ['predictions', 'marine', input],
    queryFn: () =>
      backendApi.predictions.predictMarine({
        originLat: input?.originLat || 0,
        originLng: input?.originLng || 0,
        destLat: input?.destLat || 0,
        destLng: input?.destLng || 0,
      }),
    enabled: Boolean(input),
    retry: false,
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

export const useResetPassword = () =>
  useMutation({
    mutationFn: api.auth.resetPassword,
  })

export const useLogout = () =>
  useMutation({
    mutationFn: api.auth.logout,
  })

export const useBecomeCarrier = () =>
  useMutation({
    mutationFn: api.auth.becomeCarrier,
  })
