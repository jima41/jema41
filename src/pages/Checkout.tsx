import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useAnalytics } from '@/context/AnalyticsContext';
import { useOrderManagement } from '@/store/useAdminStore';
import { ArrowLeft } from 'lucide-react';

interface ShippingInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

type CheckoutStep = 1 | 2 | 3;

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, cartItemsCount, setIsCartOpen } = useCart();
  const { trackPageView, trackPageExit } = useAnalytics();
  const { createOrder, deductStock } = useOrderManagement();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>(1);
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'France',
  });

  // Track page view
  useEffect(() => {
    trackPageView('/checkout', 'Checkout');
    return () => trackPageExit('/checkout');
  }, [trackPageView, trackPageExit]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=checkout');
    }
  }, [user, navigate]);

  // Redirect if cart is empty
  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/');
    }
  }, [cartItems, navigate]);

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({ ...prev, [name]: value }));
  };

  const isStep1Valid = () => {
    return shippingInfo.firstName.trim() && 
           shippingInfo.lastName.trim() && 
           shippingInfo.email.trim() && 
           shippingInfo.phone.trim() && 
           shippingInfo.address.trim() && 
           shippingInfo.city.trim() && 
           shippingInfo.postalCode.trim();
  };

  const handleCheckout = () => {
    const subtotal = calculateSubtotal();
    const shippingCost = subtotal >= 100 ? 0 : 9.99;
    const total = subtotal + shippingCost;

    // Convert cart items to order items
    const orderItems = cartItems.map(item => ({
      productId: item.id,
      productName: item.name,
      quantity: item.quantity,
      price: item.price,
      volume: item.volume,
    }));

    // Deduct stock
    const stockOk = deductStock(orderItems);
    if (!stockOk) {
      alert('Stock insuffisant pour certains produits');
      return;
    }

    // Create order
    const order = createOrder({
      userId: user?.id,
      userName: user?.username,
      userEmail: user?.email,
      items: orderItems,
      totalAmount: total,
      shippingAddress: {
        address: shippingInfo.address,
        city: shippingInfo.city,
        postalCode: shippingInfo.postalCode,
        country: shippingInfo.country,
      },
      status: 'completed',
    });

    // Navigate to success
    navigate('/success');
  };

  const handleNextStep = () => {
    if (currentStep === 1 && !isStep1Valid()) {
      return;
    }
    if (currentStep < 3) {
      setCurrentStep((currentStep + 1) as CheckoutStep);
      window.scrollTo(0, 0);
    } else if (currentStep === 3) {
      handleCheckout();
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as CheckoutStep);
      window.scrollTo(0, 0);
    }
  };

  const subtotal = calculateSubtotal();
  const shippingCost = subtotal >= 100 ? 0 : 9.99;
  const total = subtotal + shippingCost;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header cartItemsCount={cartItemsCount} onCartClick={() => setIsCartOpen(true)} />

      <main className="flex-1 py-16 md:py-24">
        <div className="container mx-auto max-w-4xl px-4">
            {/* Back Button */}
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 text-foreground/70 hover:text-foreground transition-colors mb-12 text-xs tracking-[0.15em] uppercase font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour au panier
            </button>

          {/* Progress Bar */}
          <div className="mb-16">
            <div className="h-px bg-border/40 relative overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#D4AF37] via-[#FCEEAC] to-[#D4AF37]"
                initial={{ width: '0%' }}
                animate={{ width: `${(currentStep / 3) * 100}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
            <div className="flex justify-between mt-6">
              {[1, 2, 3].map((step) => (
                <motion.div
                  key={step}
                  className={`text-xs font-medium uppercase tracking-widest transition-all ${
                    step <= currentStep ? 'text-[#D4AF37]' : 'text-foreground/40'
                  }`}
                  animate={{ opacity: step <= currentStep ? 1 : 0.5 }}
                >
                  {step === 1 ? 'Livraison' : step === 2 ? 'Récapitulatif' : 'Paiement'}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="mx-auto">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="glass rounded-2xl p-8 md:p-12 border border-border/30"
            >
              {/* Step 1: Shipping Information */}
              {currentStep === 1 && (
                <div>
                  <h2 className="font-serif text-3xl mb-8">Informations de Livraison</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-foreground/70 mb-2">
                        Prénom
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={shippingInfo.firstName}
                        onChange={handleShippingChange}
                        className="w-full px-4 py-3 rounded-lg border border-border/40 focus:border-[#D4AF37]/60 focus:ring-2 focus:ring-[#D4AF37]/20 bg-background/50 backdrop-blur-sm text-sm transition-all outline-none"
                        placeholder="Jean"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-widest text-foreground/70 mb-2">
                        Nom
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={shippingInfo.lastName}
                        onChange={handleShippingChange}
                        className="w-full px-4 py-3 rounded-lg border border-border/40 focus:border-[#D4AF37]/60 focus:ring-2 focus:ring-[#D4AF37]/20 bg-background/50 backdrop-blur-sm text-sm transition-all outline-none"
                        placeholder="Dupont"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-widest text-foreground/70 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={shippingInfo.email}
                        onChange={handleShippingChange}
                        className="w-full px-4 py-3 rounded-lg border border-border/40 focus:border-[#D4AF37]/60 focus:ring-2 focus:ring-[#D4AF37]/20 bg-background/50 backdrop-blur-sm text-sm transition-all outline-none"
                        placeholder="jean@example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-widest text-foreground/70 mb-2">
                        Téléphone
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={shippingInfo.phone}
                        onChange={handleShippingChange}
                        className="w-full px-4 py-3 rounded-lg border border-border/40 focus:border-[#D4AF37]/60 focus:ring-2 focus:ring-[#D4AF37]/20 bg-background/50 backdrop-blur-sm text-sm transition-all outline-none"
                        placeholder="+33 6 12 34 56 78"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs uppercase tracking-widest text-foreground/70 mb-2">
                        Adresse
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={shippingInfo.address}
                        onChange={handleShippingChange}
                        className="w-full px-4 py-3 rounded-lg border border-border/40 focus:border-[#D4AF37]/60 focus:ring-2 focus:ring-[#D4AF37]/20 bg-background/50 backdrop-blur-sm text-sm transition-all outline-none"
                        placeholder="123 Rue de la Parfumerie"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-widest text-foreground/70 mb-2">
                        Ville
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={shippingInfo.city}
                        onChange={handleShippingChange}
                        className="w-full px-4 py-3 rounded-lg border border-border/40 focus:border-[#D4AF37]/60 focus:ring-2 focus:ring-[#D4AF37]/20 bg-background/50 backdrop-blur-sm text-sm transition-all outline-none"
                        placeholder="Paris"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-widest text-foreground/70 mb-2">
                        Code Postal
                      </label>
                      <input
                        type="text"
                        name="postalCode"
                        value={shippingInfo.postalCode}
                        onChange={handleShippingChange}
                        className="w-full px-4 py-3 rounded-lg border border-border/40 focus:border-[#D4AF37]/60 focus:ring-2 focus:ring-[#D4AF37]/20 bg-background/50 backdrop-blur-sm text-sm transition-all outline-none"
                        placeholder="75001"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-widest text-foreground/70 mb-2">
                        Pays
                      </label>
                      <select
                        name="country"
                        value={shippingInfo.country}
                        onChange={handleShippingChange}
                        className="w-full px-4 py-3 rounded-lg border border-border/40 focus:border-[#D4AF37]/60 focus:ring-2 focus:ring-[#D4AF37]/20 bg-background/50 backdrop-blur-sm text-sm transition-all outline-none"
                      >
                        <option value="France">France</option>
                        <option value="Belgique">Belgique</option>
                        <option value="Suisse">Suisse</option>
                        <option value="Luxembourg">Luxembourg</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Order Summary */}
              {currentStep === 2 && (
                <div>
                  <h2 className="font-serif text-3xl mb-8">Récapitulatif de Commande</h2>

                  <div className="space-y-4 mb-8 max-h-96 overflow-y-auto">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex gap-4 p-4 rounded-lg bg-card/50 border border-border/30">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <p className="text-xs text-foreground/70 uppercase tracking-[0.1em] mb-1">
                            {item.brand}
                          </p>
                          <h3 className="font-serif font-normal">{item.name}</h3>
                          <div className="flex justify-between items-end mt-2">
                            <span className="text-xs text-foreground/70">
                              Quantité: <span className="font-medium">{item.quantity}</span>
                            </span>
                            <span className="font-serif font-light">
                              {(item.price * item.quantity).toFixed(2)}€
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Shipping Info Summary */}
                  <div className="p-4 rounded-lg bg-secondary/30 border border-border/30 mb-8">
                    <h3 className="font-serif font-normal mb-3 text-sm">Livraison à :</h3>
                    <p className="text-xs text-foreground/80 space-y-1">
                      <div>{shippingInfo.firstName} {shippingInfo.lastName}</div>
                      <div>{shippingInfo.address}</div>
                      <div>{shippingInfo.postalCode} {shippingInfo.city}</div>
                      <div>{shippingInfo.phone}</div>
                    </p>
                  </div>

                  {/* Totals */}
                  <div className="space-y-3 border-t border-border/30 pt-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground/70">Sous-total</span>
                      <span className="font-serif font-light">{subtotal.toFixed(2)}€</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground/70">
                        Livraison {shippingCost === 0 && '(gratuite)'}
                      </span>
                      <span className="font-serif font-light">{shippingCost.toFixed(2)}€</span>
                    </div>
                    <div className="flex justify-between text-lg border-t border-border/30 pt-3">
                      <span className="font-serif">Total</span>
                      <span className="font-serif text-2xl font-light text-[#D4AF37]">
                        {total.toFixed(2)}€
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Payment (Placeholder) */}
              {currentStep === 3 && (
                <div>
                  <h2 className="font-serif text-3xl mb-8">Paiement</h2>
                  <div className="space-y-6">
                    <div className="p-8 rounded-lg border-2 border-dashed border-border/40 text-center">
                      <p className="text-foreground/70 mb-4">
                        Intégration Stripe en cours...
                      </p>
                      <p className="text-xs text-foreground/50 uppercase tracking-widest">
                        Zone de paiement sécurisée
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-secondary/30 border border-border/30">
                      <p className="text-sm text-foreground/80">
                        <strong>Montant à payer :</strong>{' '}
                        <span className="font-serif font-light text-lg text-[#D4AF37]">
                          {total.toFixed(2)}€
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-12 pt-8 border-t border-border/20">
              <motion.button
                onClick={handlePreviousStep}
                disabled={currentStep === 1}
                className="px-6 py-2 rounded-lg border border-border/40 text-sm font-medium text-foreground/70 disabled:opacity-50 disabled:cursor-not-allowed hover:border-border/80 hover:text-foreground transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Précédent
              </motion.button>

              <div className="text-xs text-foreground/60 uppercase tracking-widest">
                Étape {currentStep} / 3
              </div>

              <motion.button
                onClick={handleNextStep}
                disabled={currentStep === 1 && !isStep1Valid()}
                className="px-6 py-2 rounded-lg border border-[#D4AF37]/60 bg-gradient-to-r from-[#D4AF37]/10 to-[#FCEEAC]/10 text-sm font-medium text-foreground hover:border-[#D4AF37] hover:bg-gradient-to-r hover:from-[#D4AF37]/20 hover:to-[#FCEEAC]/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {currentStep === 3 ? 'Passer à la caisse' : 'Suivant'}
              </motion.button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;
