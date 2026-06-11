import { Outlet } from 'react-router-dom'

export default function GuestLayout() {
  return (
    <div className="min-h-screen px-3 py-4 sm:px-6">
      <div className="mx-auto min-h-[calc(100vh-2rem)] max-w-[430px] rounded-[32px] border border-white/10 bg-[#040b16]/90 p-5 shadow-[0_30px_120px_rgba(2,8,23,0.55)] backdrop-blur-xl">
        <div className="flex min-h-[calc(100vh-6rem)] flex-col justify-center">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
