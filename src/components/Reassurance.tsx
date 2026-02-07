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
    <section className="py-16 border-t border-border/50">
      <div className="container mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {reassurances.map((item, index) => (
            <div 
              key={index} 
              className="text-center group animate-fade-up opacity-0"
              style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-secondary mb-4 group-hover:bg-champagne/30 transition-colors duration-300">
                <item.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-serif font-normal mb-2 text-foreground">{item.title}</h3>
              <p className="text-sm text-foreground/70 leading-relaxed">
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
