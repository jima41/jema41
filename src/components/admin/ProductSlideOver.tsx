import React, { useState, useEffect, useMemo } from 'react';
import { X, ChevronDown, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { useAdminStore, Product, classifyPerfume } from '@/store/useAdminStore';
import { useToast } from '@/hooks/use-toast';
import useSupabaseErrorHandler from '@/hooks/use-supabase-error';
import { getTeteNoteIds, getCoeurNoteIds, getFondNoteIds } from '@/lib/olfactory';
import type { TeteNote, CoeurNote, FondNote, OlfactoryFamily } from '@/lib/olfactory';

interface ProductSlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'add' | 'edit';
  product?: Product | null;
}

const generateId = (): string => {
  return `prod-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Utility to get label from note ID
const getNoteLabel = (noteId: string): string => {
  return noteId.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

export const ProductSlideOver: React.FC<ProductSlideOverProps> = ({
  isOpen,
  onClose,
  mode,
  product,
}) => {
  const { addProduct, updateProduct } = useAdminStore();
  const { toast } = useToast();
  const { handleError, handleSuccess } = useSupabaseErrorHandler();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    price: 0,
    image: '',
    stock: 50,
    monthlySales: 50,
    description: '',
    volume: '50ml',
    notes_tete: [] as TeteNote[],
    notes_coeur: [] as CoeurNote[],
    notes_fond: [] as FondNote[],
  });

  const [calculatedFamilies, setCalculatedFamilies] = useState<OlfactoryFamily[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [searchQueries, setSearchQueries] = useState({
    tete: '',
    coeur: '',
    fond: '',
  });
  const [openDropdowns, setOpenDropdowns] = useState({
    tete: false,
    coeur: false,
    fond: false,
  });


  // Filter notes based on search query
  const filteredTeteNotes = useMemo(
    () => getTeteNoteIds().filter(note =>
      getNoteLabel(note).toLowerCase().includes(searchQueries.tete.toLowerCase())
    ),
    [searchQueries.tete]
  );

  const filteredCoeurNotes = useMemo(
    () => getCoeurNoteIds().filter(note =>
      getNoteLabel(note).toLowerCase().includes(searchQueries.coeur.toLowerCase())
    ),
    [searchQueries.coeur]
  );

  const filteredFondNotes = useMemo(
    () => getFondNoteIds().filter(note =>
      getNoteLabel(note).toLowerCase().includes(searchQueries.fond.toLowerCase())
    ),
    [searchQueries.fond]
  );

  // Calculate families in real-time
  useEffect(() => {
    const families = classifyPerfume(formData.notes_tete, formData.notes_coeur, formData.notes_fond);
    setCalculatedFamilies(Array.from(families));
  }, [formData.notes_tete, formData.notes_coeur, formData.notes_fond]);

  // Pré-remplir le formulaire en mode édition
  useEffect(() => {
    if (mode === 'edit' && product) {
      setFormData({
        name: product.name,
        brand: product.brand,
        price: product.price,
        image: product.image,
        stock: product.stock,
        monthlySales: product.monthlySales,
        description: product.description || '',
        volume: product.volume || '50ml',
        notes_tete: product.notes_tete || [],
        notes_coeur: product.notes_coeur || [],
        notes_fond: product.notes_fond || [],
      });
    } else {
      setFormData({
        name: '',
        brand: '',
        price: 0,
        image: '',
        stock: 50,
        monthlySales: 50,
        description: '',
        volume: '50ml',
        notes_tete: [],
        notes_coeur: [],
        notes_fond: [],
      });
    }
    setSearchQueries({ tete: '', coeur: '', fond: '' });
    setOpenDropdowns({ tete: false, coeur: false, fond: false });
    setErrors({});
  }, [mode, product, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Le nom est requis';
    if (!formData.brand.trim()) newErrors.brand = 'La marque est requise';
    if (formData.price <= 0) newErrors.price = 'Le prix doit être supérieur à 0';
    if (formData.notes_tete.length === 0 && formData.notes_coeur.length === 0 && formData.notes_fond.length === 0) {
      newErrors.notes = 'Sélectionnez au moins une note olfactive';
    }
    if (calculatedFamilies.length === 0) {
      newErrors.families = 'Impossible de classifier le parfum - sélectionnez d\'autres notes';
    }
    if (!formData.image.trim()) newErrors.image = "L'URL de l'image est requise";
    if (formData.stock < 0) newErrors.stock = 'Le stock ne peut pas être négatif';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const productData = {
        ...formData,
        families: calculatedFamilies,
        scent: [...formData.notes_tete, ...formData.notes_coeur, ...formData.notes_fond]
          .map(getNoteLabel)
          .join(', '),
        category: calculatedFamilies[0] || 'Non classifié',
        notes: [...formData.notes_tete, ...formData.notes_coeur, ...formData.notes_fond],
      };

      if (mode === 'add') {
        const newProduct: Product = {
          id: generateId(),
          ...productData,
        };
        await addProduct(newProduct);
        handleSuccess('Produit ajouté avec succès ✨', 'Succès');
      } else if (product) {
        await updateProduct(product.id, productData);
        handleSuccess('Produit modifié avec succès ✨', 'Succès');
      }

      onClose();
    } catch (error) {
      handleError(error, 'Une erreur est survenue lors de la sauvegarde du produit');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xl z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over Panel */}
      <div
        className={`fixed right-0 top-0 h-screen w-full max-w-2xl bg-[#1A1D23] border-l border-admin-border shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-admin-border">
          <h2 className="text-2xl font-bold text-admin-text-primary font-montserrat">
            {mode === 'add' ? 'Ajouter un Parfum' : 'Modifier le Parfum'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-admin-card rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-admin-text-secondary" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Nom */}
          <div>
            <Label className="text-admin-text-secondary uppercase text-xs tracking-wide font-montserrat mb-2 block">
              Nom du Parfum *
            </Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Rose Éternelle"
              className={`bg-admin-card border-admin-border text-admin-text-primary ${
                errors.name ? 'border-red-500' : ''
              }`}
            />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Marque */}
          <div>
            <Label className="text-admin-text-secondary uppercase text-xs tracking-wide font-montserrat mb-2 block">
              Marque *
            </Label>
            <Input
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              placeholder="Ex: Luxe Fragrances"
              className={`bg-admin-card border-admin-border text-admin-text-primary ${
                errors.brand ? 'border-red-500' : ''
              }`}
            />
            {errors.brand && <p className="text-red-400 text-xs mt-1">{errors.brand}</p>}
          </div>

          {/* Prix */}
          <div>
            <Label className="text-admin-text-secondary uppercase text-xs tracking-wide font-montserrat mb-2 block">
              Prix (€) *
            </Label>
            <Input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
              placeholder="99.99"
              className={`bg-admin-card border-admin-border text-admin-text-primary ${
                errors.price ? 'border-red-500' : ''
              }`}
              step="0.01"
              min="0"
            />
            {errors.price && <p className="text-red-400 text-xs mt-1">{errors.price}</p>}
          </div>

        {/* Notes de Tête */}
        <div>
          <Label className="text-admin-text-secondary uppercase text-xs tracking-wide font-montserrat mb-2 block">
            Sélectionner Notes de Tête *
          </Label>
          <div className="relative">
            <button
              onClick={() => setOpenDropdowns({ ...openDropdowns, tete: !openDropdowns.tete })}
              className="w-full flex items-center justify-between px-3 py-2 bg-admin-card border border-admin-border rounded-md text-admin-text-primary hover:border-amber-500/50 transition-colors"
            >
              <span className="text-sm">
                {formData.notes_tete.length > 0
                  ? `${formData.notes_tete.length} note${formData.notes_tete.length > 1 ? 's' : ''} sélectionnée${formData.notes_tete.length > 1 ? 's' : ''}`
                  : 'Sélectionner...'}
              </span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  openDropdowns.tete ? 'rotate-180' : ''
                }`}
              />
            </button>

            {openDropdowns.tete && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-admin-card border border-admin-border rounded-md shadow-lg z-50 max-h-64 overflow-hidden flex flex-col">
                <div className="p-2 border-b border-admin-border sticky top-0 bg-admin-card">
                  <div className="flex items-center gap-2 bg-admin-border/30 px-2 py-1 rounded">
                    <Search className="w-4 h-4 text-admin-text-secondary" />
                    <input
                      type="text"
                      placeholder="Rechercher..."
                      value={searchQueries.tete}
                      onChange={(e) => setSearchQueries({ ...searchQueries, tete: e.target.value })}
                      className="bg-transparent text-admin-text-primary text-xs outline-none flex-1"
                    />
                  </div>
                </div>
                <div className="overflow-y-auto">
                  {filteredTeteNotes.map((note) => (
                    <button
                      key={note}
                      onClick={() => {
                        setFormData({
                          ...formData,
                          notes_tete: formData.notes_tete.includes(note)
                            ? formData.notes_tete.filter(n => n !== note)
                            : [...formData.notes_tete, note],
                        });
                      }}
                      className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                        formData.notes_tete.includes(note)
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'text-admin-text-secondary hover:bg-admin-border/30'
                      }`}
                    >
                      {formData.notes_tete.includes(note) ? '✓ ' : '  '}{getNoteLabel(note)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          {formData.notes_tete.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.notes_tete.map((note) => (
                <Badge key={note} variant="secondary" className="bg-amber-500/20 text-amber-400 text-xs">
                  {getNoteLabel(note)}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Notes de Cœur */}
        <div>
          <Label className="text-admin-text-secondary uppercase text-xs tracking-wide font-montserrat mb-2 block">
            Sélectionner Notes de Cœur *
          </Label>
          <div className="relative">
            <button
              onClick={() => setOpenDropdowns({ ...openDropdowns, coeur: !openDropdowns.coeur })}
              className="w-full flex items-center justify-between px-3 py-2 bg-admin-card border border-admin-border rounded-md text-admin-text-primary hover:border-amber-500/50 transition-colors"
            >
              <span className="text-sm">
                {formData.notes_coeur.length > 0
                  ? `${formData.notes_coeur.length} note${formData.notes_coeur.length > 1 ? 's' : ''} sélectionnée${formData.notes_coeur.length > 1 ? 's' : ''}`
                  : 'Sélectionner...'}
              </span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  openDropdowns.coeur ? 'rotate-180' : ''
                }`}
              />
            </button>

            {openDropdowns.coeur && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-admin-card border border-admin-border rounded-md shadow-lg z-50 max-h-64 overflow-hidden flex flex-col">
                <div className="p-2 border-b border-admin-border sticky top-0 bg-admin-card">
                  <div className="flex items-center gap-2 bg-admin-border/30 px-2 py-1 rounded">
                    <Search className="w-4 h-4 text-admin-text-secondary" />
                    <input
                      type="text"
                      placeholder="Rechercher..."
                      value={searchQueries.coeur}
                      onChange={(e) => setSearchQueries({ ...searchQueries, coeur: e.target.value })}
                      className="bg-transparent text-admin-text-primary text-xs outline-none flex-1"
                    />
                  </div>
                </div>
                <div className="overflow-y-auto">
                  {filteredCoeurNotes.map((note) => (
                    <button
                      key={note}
                      onClick={() => {
                        setFormData({
                          ...formData,
                          notes_coeur: formData.notes_coeur.includes(note)
                            ? formData.notes_coeur.filter(n => n !== note)
                            : [...formData.notes_coeur, note],
                        });
                      }}
                      className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                        formData.notes_coeur.includes(note)
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'text-admin-text-secondary hover:bg-admin-border/30'
                      }`}
                    >
                      {formData.notes_coeur.includes(note) ? '✓ ' : '  '}{getNoteLabel(note)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          {formData.notes_coeur.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.notes_coeur.map((note) => (
                <Badge key={note} variant="secondary" className="bg-amber-500/20 text-amber-400 text-xs">
                  {getNoteLabel(note)}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Notes de Fond */}
        <div>
          <Label className="text-admin-text-secondary uppercase text-xs tracking-wide font-montserrat mb-2 block">
            Sélectionner Notes de Fond *
          </Label>
          <div className="relative">
            <button
              onClick={() => setOpenDropdowns({ ...openDropdowns, fond: !openDropdowns.fond })}
              className="w-full flex items-center justify-between px-3 py-2 bg-admin-card border border-admin-border rounded-md text-admin-text-primary hover:border-amber-500/50 transition-colors"
            >
              <span className="text-sm">
                {formData.notes_fond.length > 0
                  ? `${formData.notes_fond.length} note${formData.notes_fond.length > 1 ? 's' : ''} sélectionnée${formData.notes_fond.length > 1 ? 's' : ''}`
                  : 'Sélectionner...'}
              </span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  openDropdowns.fond ? 'rotate-180' : ''
                }`}
              />
            </button>

            {openDropdowns.fond && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-admin-card border border-admin-border rounded-md shadow-lg z-50 max-h-64 overflow-hidden flex flex-col">
                <div className="p-2 border-b border-admin-border sticky top-0 bg-admin-card">
                  <div className="flex items-center gap-2 bg-admin-border/30 px-2 py-1 rounded">
                    <Search className="w-4 h-4 text-admin-text-secondary" />
                    <input
                      type="text"
                      placeholder="Rechercher..."
                      value={searchQueries.fond}
                      onChange={(e) => setSearchQueries({ ...searchQueries, fond: e.target.value })}
                      className="bg-transparent text-admin-text-primary text-xs outline-none flex-1"
                    />
                  </div>
                </div>
                <div className="overflow-y-auto">
                  {filteredFondNotes.map((note) => (
                    <button
                      key={note}
                      onClick={() => {
                        setFormData({
                          ...formData,
                          notes_fond: formData.notes_fond.includes(note)
                            ? formData.notes_fond.filter(n => n !== note)
                            : [...formData.notes_fond, note],
                        });
                      }}
                      className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                        formData.notes_fond.includes(note)
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'text-admin-text-secondary hover:bg-admin-border/30'
                      }`}
                    >
                      {formData.notes_fond.includes(note) ? '✓ ' : '  '}{getNoteLabel(note)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          {formData.notes_fond.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.notes_fond.map((note) => (
                <Badge key={note} variant="secondary" className="bg-amber-500/20 text-amber-400 text-xs">
                  {getNoteLabel(note)}
                </Badge>
              ))}
            </div>
          )}
          {errors.notes && <p className="text-red-400 text-xs mt-1">{errors.notes}</p>}
        </div>

        {/* Familles Olfactives (Calculated) */}
        <div>
          <Label className="text-admin-text-secondary uppercase text-xs tracking-wide font-montserrat mb-2 block">
            Familles Détectées ✨
          </Label>
          <div className="flex flex-wrap gap-2">
            {calculatedFamilies.length > 0 ? (
              calculatedFamilies.map((family) => (
                <Badge 
                  key={family} 
                  className="bg-gradient-to-r from-amber-400 to-amber-500 text-black font-semibold text-xs"
                >
                  {family}
                </Badge>
              ))
            ) : (
              <p className="text-admin-text-secondary text-xs">Sélectionnez des notes pour détecter automatiquement les familles</p>
            )}
          </div>
          {errors.families && <p className="text-red-400 text-xs mt-1">{errors.families}</p>}
        </div>

          {/* Stock Initial */}
          <div>
            <Label className="text-admin-text-secondary uppercase text-xs tracking-wide font-montserrat mb-2 block">
              Stock Initial *
            </Label>
            <Input
              type="number"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
              placeholder="50"
              className={`bg-admin-card border-admin-border text-admin-text-primary ${
                errors.stock ? 'border-red-500' : ''
              }`}
              min="0"
            />
            {errors.stock && <p className="text-red-400 text-xs mt-1">{errors.stock}</p>}
          </div>

          {/* Vélocité (Slider) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-admin-text-secondary uppercase text-xs tracking-wide font-montserrat">
                Vélocité (Ventes/mois)
              </Label>
              <span className="text-admin-gold font-semibold">{formData.monthlySales}</span>
            </div>
            <Slider
              value={[formData.monthlySales]}
              onValueChange={(value) => setFormData({ ...formData, monthlySales: value[0] })}
              min={0}
              max={200}
              step={5}
              className="w-full"
            />
            <p className="text-xs text-admin-text-secondary mt-2">
              Ajustez pour tester les prédictions de rupture de stock
            </p>
          </div>

          {/* URL Image */}
          <div>
            <Label className="text-admin-text-secondary uppercase text-xs tracking-wide font-montserrat mb-2 block">
              URL Image *
            </Label>
            <Input
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              placeholder="https://..."
              className={`bg-admin-card border-admin-border text-admin-text-primary ${
                errors.image ? 'border-red-500' : ''
              }`}
            />
            {errors.image && <p className="text-red-400 text-xs mt-1">{errors.image}</p>}
          </div>

          {/* Description */}
          <div>
            <Label className="text-admin-text-secondary uppercase text-xs tracking-wide font-montserrat mb-2 block">
              Description
            </Label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Décrivez ce parfum..."
              className="w-full px-3 py-2 bg-admin-card border border-admin-border rounded-md text-admin-text-primary text-sm resize-none"
              rows={4}
            />
          </div>

          {/* Volume */}
          <div>
            <Label className="text-admin-text-secondary uppercase text-xs tracking-wide font-montserrat mb-2 block">
              Volume
            </Label>
            <Input
              value={formData.volume}
              onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
              placeholder="50ml"
              className="bg-admin-card border-admin-border text-admin-text-primary"
            />
          </div>
        </div>

        {/* Footer - Actions */}
        <div className="flex gap-3 p-6 border-t border-admin-border">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 border-admin-border text-admin-text-secondary hover:bg-admin-card"
          >
            Annuler
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSubmitting}
            className="flex-1 bg-gradient-to-r from-amber-400 to-amber-500 text-black hover:from-amber-300 hover:to-amber-400 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {'Sauvegarde...'}
              </>
            ) : (
              mode === 'add' ? 'Créer' : 'Modifier'
            )}
          </Button>
        </div>
      </div>
    </>
  );
};

export default ProductSlideOver;
