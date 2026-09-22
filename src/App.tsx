import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'
import { RequireAuth } from '@/components/layout/AppShell'
import { TooltipProvider } from '@/components/ui/overlays'
import { useSession } from '@/store/useSession'
import { usePrefs } from '@/store/usePrefs'
import { TrailerPlayer } from '@/trailer/TrailerPlayer'
import LoginPage from '@/features/auth/LoginPage'

const ProposalPage = lazy(() => import('@/proposal/ProposalPage'))
const Dashboard = lazy(() => import('@/features/admin/Dashboard'))
const Comercios = lazy(() => import('@/features/admin/Comercios'))
const ComercioDetalle = lazy(() => import('@/features/admin/ComercioDetalle'))
const ProductosAdmin = lazy(() => import('@/features/admin/ProductosAdmin'))
const Transacciones = lazy(() => import('@/features/admin/Transacciones'))
const Monedas = lazy(() => import('@/features/admin/Monedas'))
const MiDashboard = lazy(() => import('@/features/comercio/MiDashboard'))
const MisProductos = lazy(() => import('@/features/comercio/MisProductos'))
const NuevoProducto = lazy(() => import('@/features/comercio/NuevoProducto'))
const MisVentas = lazy(() => import('@/features/comercio/MisVentas'))
const Explorar = lazy(() => import('@/features/cliente/Explorar'))
const ProductoDetalle = lazy(() => import('@/features/cliente/ProductoDetalle'))
const Favoritos = lazy(() => import('@/features/cliente/Favoritos'))
const MisCompras = lazy(() => import('@/features/cliente/MisCompras'))
const AgentPage = lazy(() => import('@/assistant/AgentPage'))
const NotFound = lazy(() => import('@/features/NotFound'))

function LoginRoute() {
  const user = useSession((s) => s.user)
  if (user) return <Navigate to="/propuesta" replace />
  return <LoginPage />
}

export default function App() {
  const theme = usePrefs((s) => s.theme)
  return (
    <TooltipProvider delayDuration={200}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginRoute />} />
          <Route element={<RequireAuth />}>
            <Route index element={<Navigate to="/propuesta" replace />} />
            <Route path="/propuesta" element={<ProposalPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/comercios" element={<Comercios />} />
            <Route path="/comercios/:comercioId" element={<ComercioDetalle />} />
            <Route path="/productos" element={<ProductosAdmin />} />
            <Route path="/transacciones" element={<Transacciones />} />
            <Route path="/monedas" element={<Monedas />} />
            <Route path="/mi-negocio" element={<MiDashboard />} />
            <Route path="/mi-negocio/productos" element={<MisProductos />} />
            <Route path="/mi-negocio/productos/nuevo" element={<NuevoProducto />} />
            <Route path="/mi-negocio/ventas" element={<MisVentas />} />
            <Route path="/explorar" element={<Explorar />} />
            <Route path="/explorar/:productoId" element={<ProductoDetalle />} />
            <Route path="/favoritos" element={<Favoritos />} />
            <Route path="/mis-compras" element={<MisCompras />} />
            <Route path="/agente" element={<AgentPage />} />
          </Route>
          <Route
            path="*"
            element={
              <Suspense fallback={null}>
                <NotFound />
              </Suspense>
            }
          />
        </Routes>
        <TrailerPlayer />
      </BrowserRouter>
      <Toaster position="top-center" theme={theme} richColors closeButton toastOptions={{ className: 'font-sans' }} />
    </TooltipProvider>
  )
}
