import { Instagram, Facebook, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <h3 className="font-serif text-3xl md:text-4xl font-normal mb-4">Rayha Store</h3>
            <p className="text-background/70 mb-6 max-w-sm font-light">
              L'art de la parfumerie de luxe, accessible à tous. Découvrez des fragrances d'exception qui racontent votre histoire.
            </p>
            <div className="flex gap-4">
              <a href="#" className="p-2 rounded-full bg-background/10 hover:bg-background/20 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 rounded-full bg-background/10 hover:bg-background/20 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 rounded-full bg-background/10 hover:bg-background/20 transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-serif text-lg font-normal mb-4 uppercase tracking-widest text-sm">Navigation</h4>
            <ul className="space-y-3 text-background/70 text-sm font-light">
              <li><a href="#" className="hover:text-background transition-colors">Tous les Parfums</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-serif text-lg font-normal mb-4 uppercase tracking-widest text-sm">Support</h4>
            <ul className="space-y-3 text-background/70 text-sm font-light">
              <li><a href="#" className="hover:text-background transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-background transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-background transition-colors">Livraison</a></li>
              <li><a href="#" className="hover:text-background transition-colors">Retours</a></li>
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="mt-12 pt-8 border-t border-background/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h4 className="font-serif text-2xl md:text-3xl font-normal mb-2">Restez informé</h4>
              <p className="text-sm text-background/70">
                Inscrivez-vous pour recevoir nos offres exclusives
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <input
                type="email"
                placeholder="Votre email"
                className="flex-1 sm:w-auto px-4 py-3 rounded-lg bg-background/15 border border-background/30 hover:border-background/50 text-background placeholder:text-background/50 focus:outline-none focus:border-background/60 focus:ring-2 focus:ring-background/20 transition-all backdrop-blur-sm"
              />
              <button className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-background/40 hover:border-background/80 hover:bg-background/10 transition-all text-sm font-medium text-background whitespace-nowrap">
                S'inscrire
              </button>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-background/10 text-center text-xs text-background/50 font-light tracking-widest uppercase">
          <p>© 2025 Rayha Store. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
