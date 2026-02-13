import { Shield, Truck, CreditCard, Leaf } from 'lucide-react';

const reassurances = [
  {
    icon: Shield,
    title: 'Authenticité Garantie',
    description: '100% de parfums originaux, directement des maisons de parfumerie',
  },
  {
    icon: Truck,
    title: 'Livraison Rapide',
    description: 'Expédition sous 24h, livraison en 2-4 jours ouvrés',
  },
  {
    icon: CreditCard,
    title: 'Paiement Sécurisé',
    description: 'Transactions cryptées avec vos moyens de paiement préférés',
  },
  {
    icon: Leaf,
    title: 'Emballage Éco',
    description: 'Packaging recyclable et livraison neutre en carbone',
  },
];

const Reassurance = () => {
  return (
    <section className="py-12 md:py-16 lg:py-20 border-t border-border/50 px-5 sm:px-6 md:px-12 lg:px-20">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 md:gap-8">
          {reassurances.map((item, index) => (
            <div 
              key={index} 
              className="text-center group animate-fade-up opacity-0 p-4 sm:p-6 rounded-lg hover:bg-secondary/20 transition-colors duration-300"
              style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
            >
              <div className="inline-flex items-center justify-center w-12 sm:w-14 h-12 sm:h-14 rounded-2xl bg-secondary mb-3 sm:mb-4 group-hover:bg-champagne/30 transition-colors duration-300">
                <item.icon className="w-5 sm:w-6 h-5 sm:h-6 text-primary" />
              </div>
              <h3 className="font-serif font-normal mb-2 text-sm md:text-base text-foreground">{item.title}</h3>
              <p className="text-xs md:text-sm text-foreground/70 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Reassurance;
