import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import CartDrawer from '@/components/CartDrawer';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();
  const { cartItems, cartItemsCount, isCartOpen, addToCart, updateQuantity, removeItem, setIsCartOpen } = useCart();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header cartItemsCount={cartItemsCount} onCartClick={() => setIsCartOpen(true)} />

      <main className="flex-1 py-8 md:py-16">
        <div className="container mx-auto max-w-md">
          {/* Breadcrumb */}
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>

          {/* Form Container */}
          <div className="bg-card rounded-2xl p-8 border border-border/50">
            <h1 className="font-serif text-3xl md:text-4xl font-normal mb-3">Connexion</h1>
            <p className="text-foreground/70 mb-8 font-light">Accédez à votre compte Rayha Store</p>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username Field */}
              <div>
                <label htmlFor="username" className="block text-xs uppercase tracking-widest text-foreground/70 mb-2 font-medium">
                  Identifiant
                </label>
                <input
                  id="username"
                  type="text"
                  placeholder="Votre identifiant"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-xs uppercase tracking-widest text-foreground/70 mb-2 font-medium">
                  Mot de passe
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="Votre mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-lg border border-border/40 hover:border-border/80 hover:bg-secondary/30 transition-all text-sm font-medium text-foreground disabled:opacity-50"
              >
                {isLoading ? 'Connexion en cours...' : 'Se connecter'}
              </button>
            </form>

            {/* Links */}
            <div className="mt-8 space-y-4 text-center text-sm">
              <div>
                <Link to="/signup" className="text-primary hover:underline">
                  Créer un compte
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeItem}
      />
    </div>
  );
};

export default Login;
