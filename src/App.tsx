import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { AdminProvider } from "@/context/AdminContext";
import { AnalyticsProvider } from "@/context/AnalyticsContext";
import AnnouncementBar from "@/components/AnnouncementBar";
import DataSyncInitializer from "@/components/DataSyncInitializer";
import Index from "./pages/Index";
import ProductDetail from "./pages/ProductDetail";
import SearchResults from "./pages/SearchResults";
import AllProducts from "./pages/AllProducts";
import Favorites from "./pages/Favorites";
import Checkout from "./pages/Checkout";
import Success from "./pages/Success";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import UserProfile from "./pages/UserProfile";
import NotFound from "./pages/NotFound";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminInventory from "./pages/admin/AdminInventory";
import AdminFeatured from "./pages/admin/AdminFeatured";
import AdminClients from "./pages/admin/AdminClients";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminCRM from "./pages/admin/AdminCRM";
import AdminGuide from "./pages/AdminGuide";
import { ProtectedRoute } from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AnalyticsProvider>
        <AuthProvider>
          <AdminProvider>
            <CartProvider>
              <DataSyncInitializer>
                <AnnouncementBar />
                <HashRouter>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/product/:id" element={<ProductDetail />} />
                    <Route path="/search" element={<SearchResults />} />
                    <Route path="/all-products" element={<AllProducts />} />
                    <Route path="/favorites" element={<Favorites />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/success" element={<Success />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/mes-informations" element={<UserProfile />} />
                    <Route path="/admin" element={<AdminGuide />} />
                
                {/* Admin Protected Routes - Only Jema41 (admin) */}
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute requiredRole="admin" requiredUsername="Jema41">
                      <AdminLayout>
                        <AdminDashboard />
                      </AdminLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/inventory"
                  element={
                    <ProtectedRoute requiredRole="admin" requiredUsername="Jema41">
                      <AdminLayout>
                        <AdminInventory />
                      </AdminLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/featured"
                  element={
                    <ProtectedRoute requiredRole="admin" requiredUsername="Jema41">
                      <AdminLayout>
                        <AdminFeatured />
                      </AdminLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/clients"
                  element={
                    <ProtectedRoute requiredRole="admin" requiredUsername="Jema41">
                      <AdminLayout>
                        <AdminClients />
                      </AdminLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/orders"
                  element={
                    <ProtectedRoute requiredRole="admin" requiredUsername="Jema41">
                      <AdminLayout>
                        <AdminOrders />
                      </AdminLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/analytics"
                  element={
                    <ProtectedRoute requiredRole="admin" requiredUsername="Jema41">
                      <AdminLayout>
                        <AdminAnalytics />
                      </AdminLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/crm"
                  element={
                    <ProtectedRoute requiredRole="admin" requiredUsername="Jema41">
                      <AdminLayout>
                        <AdminCRM />
                      </AdminLayout>
                    </ProtectedRoute>
                  }
                />
                
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </HashRouter>
              </DataSyncInitializer>
            </CartProvider>
          </AdminProvider>
        </AuthProvider>
      </AnalyticsProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
