/**
 * Configuration Supabase pour Rayha Store
 * Dédiée à la gestion des produits et synchronisation en temps réel
 * 
 * Utilise les variables d'environnement:
 * - VITE_SUPABASE_URL
 * - VITE_SUPABASE_PUBLISHABLE_KEY
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// ============================================================================
// CONFIGURATION CLIENT SUPABASE
// ============================================================================

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

console.log('🔧 Configuration Supabase:');
console.log('   VITE_SUPABASE_URL:', SUPABASE_URL ? '✅ Présente' : '❌ MANQUANTE!');
console.log('   VITE_SUPABASE_PUBLISHABLE_KEY:', SUPABASE_ANON_KEY ? '✅ Présente' : '❌ MANQUANTE!');

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ VARIABLES MANQUANTES! Vérifiez que .env.local existe et que Vite a redémarré.');
  console.error('   Fichier attendu: .env.local');
  console.error('   Contenu attendu:');
  console.error('     VITE_SUPABASE_URL=https://ibkcaxatevlfvtedeqrv.supabase.co');
  console.error('     VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...');
}

export const supabase = createClient<Database>(
  SUPABASE_URL || '',
  SUPABASE_ANON_KEY || '',
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);

// ============================================================================
// TYPES POUR LES PRODUITS
// ============================================================================

export interface ProductRow {
  id: string;
  name: string;
  brand: string;
  price: number;
  description: string | null;
  image_url: string | null;
  notes_tete: string[];
  notes_coeur: string[];
  notes_fond: string[];
  families: string[];
  stock: number;
  monthlySales: number;
  volume: string | null;
  category: string | null;
  scent: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateProductInput {
  name: string;
  brand: string;
  price: number;
  description?: string;
  image_url?: string;
  notes_tete?: string[];
  notes_coeur?: string[];
  notes_fond?: string[];
  families?: string[];
  stock?: number;
  monthlySales?: number;
  volume?: string;
  category?: string;
  scent?: string;
}

export interface UpdateProductInput extends Partial<CreateProductInput> {
  id: string;
}

// ============================================================================
// ERREURS PERSONNALISÉES
// ============================================================================

export class SupabaseError extends Error {
  constructor(
    public statusCode: number | null,
    public originalError: Error | null,
    message: string
  ) {
    super(message);
    this.name = 'SupabaseError';
  }

  static fromError(error: any, context: string): SupabaseError {
    const message = error?.message || `Erreur Supabase: ${context}`;
    const statusCode = error?.status || null;
    return new SupabaseError(statusCode, error, message);
  }
}

// ============================================================================
// FONCTIONS POUR LES PRODUITS
// ============================================================================

/**
 * Récupère tous les produits de la base de données
 */
export async function fetchAllProducts(): Promise<ProductRow[]> {
  try {
    console.log('🔗 Appel à Supabase pour récupérer tous les produits...');
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Erreur Supabase:', error);
      throw SupabaseError.fromError(error, 'fetchAllProducts');
    }

    console.log(`✅ ${data?.length || 0} produits reçus de la base`);
    return (data || []) as ProductRow[];
  } catch (error) {
    console.error('❌ Erreur fetchAllProducts:', error);
    throw SupabaseError.fromError(error, 'fetchAllProducts');
  }
}

/**
 * Récupère un produit par ID
 */
export async function fetchProductById(id: string): Promise<ProductRow | null> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error?.code === 'PGRST116') {
      // Produit non trouvé
      return null;
    }

    if (error) {
      throw SupabaseError.fromError(error, `fetchProductById: ${id}`);
    }

    return (data || null) as ProductRow | null;
  } catch (error) {
    throw SupabaseError.fromError(error, `fetchProductById: ${id}`);
  }
}

/**
 * Crée un nouveau produit
 */
export async function createProduct(product: CreateProductInput): Promise<ProductRow> {
  try {
    const { data, error } = await supabase
      .from('products')
      .insert([product])
      .select()
      .single();

    if (error) {
      throw SupabaseError.fromError(error, 'createProduct');
    }

    return (data || {}) as ProductRow;
  } catch (error) {
    throw SupabaseError.fromError(error, 'createProduct');
  }
}

/**
 * Met à jour un produit existant
 */
export async function updateProduct(
  id: string,
  updates: Partial<CreateProductInput>
): Promise<ProductRow> {
  try {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw SupabaseError.fromError(error, `updateProduct: ${id}`);
    }

    return (data || {}) as ProductRow;
  } catch (error) {
    throw SupabaseError.fromError(error, `updateProduct: ${id}`);
  }
}

/**
 * Met à jour le stock d'un produit
 */
export async function updateProductStock(id: string, newStock: number): Promise<ProductRow> {
  return updateProduct(id, { stock: newStock });
}

/**
 * Met à jour les ventes mensuelles d'un produit
 */
export async function updateProductMonthlySales(
  id: string,
  newMonthlySales: number
): Promise<ProductRow> {
  return updateProduct(id, { monthlySales: newMonthlySales });
}

/**
 * Supprime un produit
 */
export async function deleteProduct(id: string): Promise<void> {
  try {
    const { error } = await supabase.from('products').delete().eq('id', id);

    if (error) {
      throw SupabaseError.fromError(error, `deleteProduct: ${id}`);
    }
  } catch (error) {
    throw SupabaseError.fromError(error, `deleteProduct: ${id}`);
  }
}

/**
 * Souscrit aux changements en temps réel des produits
 */
export function subscribeToProducts(
  callback: (payload: any) => void,
  errorCallback?: (error: Error) => void
) {
  const subscription = supabase
    .channel('products_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'products',
      },
      (payload) => {
        console.log('🔄 Changement détecté:', payload);
        callback(payload);
      }
    )
    .subscribe((status, err) => {
      if (status === 'SUBSCRIBED') {
        console.log('✅ Souscription en temps réel activée');
      } else if (status === 'CLOSED') {
        console.error('❌ Souscription fermée');
        if (errorCallback) {
          errorCallback(new Error('Souscription Supabase fermée'));
        }
      } else if (status === 'CHANNEL_ERROR') {
        console.error('❌ Erreur de canal:', err);
        if (errorCallback) {
          errorCallback(new Error(`Erreur de canal: ${err}`));
        }
      }
    });

  return subscription;
}

// ============================================================================
// CART OPERATIONS - PANIER PERSISTANT
// ============================================================================

export interface CartItemDB {
  id: string;
  user_id: string;
  product_id: string;
  product_name: string;
  product_brand: string;
  product_price: number;
  product_image: string | null;
  product_scent: string | null;
  product_category: string | null;
  quantity: number;
  added_at: string;
  updated_at: string;
}

/**
 * Récupère le panier complet d'un utilisateur depuis Supabase
 */
export async function getUserCart(userId: string): Promise<CartItemDB[]> {
  try {
    const { data, error } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', userId)
      .order('added_at', { ascending: false });

    if (error) {
      console.error('❌ Erreur lors de la récupération du panier:', error);
      throw error;
    }

    console.log(`📦 Panier chargé: ${data?.length || 0} articles`);
    return data || [];
  } catch (error) {
    console.error('❌ Erreur getUserCart:', error);
    return [];
  }
}

/**
 * Ajoute un produit au panier (ou augmente la quantité si déjà présent)
 */
export async function addToCart(
  userId: string,
  productId: string,
  product: {
    name: string;
    brand: string;
    price: number;
    image?: string;
    scent?: string;
    category?: string;
  },
  quantity: number = 1
): Promise<CartItemDB | null> {
  try {
    // Vérifier si l'item existe déjà
    const { data: existingItem, error: checkError } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .single();

    if (!checkError && existingItem) {
      // Augmenter la quantité
      const { data, error } = await supabase
        .from('cart_items')
        .update({ 
          quantity: existingItem.quantity + quantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingItem.id)
        .select()
        .single();

      if (error) throw error;
      console.log(`🆙 Quantité augmentée: ${product.name}`);
      return data as CartItemDB;
    } else {
      // Créer un nouvel item
      const { data, error } = await supabase
        .from('cart_items')
        .insert({
          user_id: userId,
          product_id: productId,
          quantity,
          product_name: product.name,
          product_brand: product.brand,
          product_price: product.price,
          product_image: product.image || null,
          product_scent: product.scent || null,
          product_category: product.category || null,
        })
        .select()
        .single();

      if (error) throw error;
      console.log(`🛒 Article ajouté au panier: ${product.name}`);
      return data as CartItemDB;
    }
  } catch (error) {
    console.error('❌ Erreur addToCart:', error);
    throw error;
  }
}

/**
 * Mets à jour la quantité d'un article du panier
 */
export async function updateCartItemQuantity(
  cartItemId: string,
  quantity: number
): Promise<CartItemDB | null> {
  try {
    if (quantity <= 0) {
      // Supprimer l'article si quantité <= 0
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', cartItemId);

      if (error) throw error;
      console.log('🗑️ Article supprimé du panier (quantité 0)');
      return null;
    }

    const { data, error } = await supabase
      .from('cart_items')
      .update({ 
        quantity,
        updated_at: new Date().toISOString()
      })
      .eq('id', cartItemId)
      .select()
      .single();

    if (error) throw error;
    console.log(`🔄 Quantité mise à jour`);
    return data as CartItemDB;
  } catch (error) {
    console.error('❌ Erreur updateCartItemQuantity:', error);
    throw error;
  }
}

/**
 * Supprime un article du panier
 */
export async function removeFromCart(cartItemId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', cartItemId);

    if (error) throw error;
    console.log('🗑️ Article supprimé du panier');
  } catch (error) {
    console.error('❌ Erreur removeFromCart:', error);
    throw error;
  }
}

/**
 * Vide complètement le panier d'un utilisateur
 */
export async function clearCart(userId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
    console.log('🗑️ Panier vidé');
  } catch (error) {
    console.error('❌ Erreur clearCart:', error);
    throw error;
  }
}

/**
 * S'abonne aux changements du panier en temps réel
 */
export function subscribeToCart(
  userId: string,
  callback: (payload: any) => void,
  errorCallback?: (error: Error) => void
) {
  const subscription = supabase
    .channel(`cart_${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'cart_items',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        console.log('🛒 Changement du panier détecté:', payload);
        callback(payload);
      }
    )
    .subscribe((status, err) => {
      if (status === 'SUBSCRIBED') {
        console.log('✅ Souscription panier en temps réel activée');
      } else if (status === 'CLOSED') {
        console.error('❌ Souscription panier fermée');
        if (errorCallback) {
          errorCallback(new Error('Souscription panier fermée'));
        }
      } else if (status === 'CHANNEL_ERROR') {
        console.error('❌ Erreur de canal panier:', err);
        if (errorCallback) {
          errorCallback(new Error(`Erreur de canal panier: ${err}`));
        }
      }
    });

  return subscription;
}

// ============================================================================
// WISHLIST OPERATIONS - FAVORIS PERSISTANTS
// ============================================================================

export interface WishlistItemDB {
  id: string;
  user_id: string;
  product_id: string;
  position: number | null;
  added_at: string;
  updated_at: string;
  // Données du produit (en jointure)
  product_name?: string;
  product_price?: number;
  product_image?: string;
}

/**
 * Récupère les favoris d'un utilisateur
 */
export async function getUserWishlist(userId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('wishlist')
      .select('product_id')
      .eq('user_id', userId)
      .order('added_at', { ascending: false });

    if (error) throw error;

    const productIds = data?.map((item: any) => item.product_id) || [];
    console.log(`❤️ Favoris chargés: ${productIds.length} produits`);
    return productIds;
  } catch (error) {
    console.error('❌ Erreur getUserWishlist:', error);
    return [];
  }
}

/**
 * Ajoute un produit aux favoris (ou le retire s'il y est déjà)
 */
export async function toggleWishlist(
  userId: string,
  productId: string
): Promise<boolean> {
  try {
    // Vérifier si le produit est déjà en favoris
    const { data: existingItem, error: checkError } = await supabase
      .from('wishlist')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .single();

    if (!checkError && existingItem) {
      // Supprimer des favoris
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('id', existingItem.id);

      if (error) throw error;
      console.log('🤍 Produit retiré des favoris');
      return false; // Indique qu'il a été retiré
    } else {
      // Ajouter aux favoris
      const { error } = await supabase
        .from('wishlist')
        .insert({
          user_id: userId,
          product_id: productId,
        });

      if (error) throw error;
      console.log('❤️ Produit ajouté aux favoris');
      return true; // Indique qu'il a été ajouté
    }
  } catch (error) {
    console.error('❌ Erreur toggleWishlist:', error);
    throw error;
  }
}

/**
 * Ajoute un produit aux favoris
 */
export async function addToWishlist(
  userId: string,
  productId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('wishlist')
      .insert({
        user_id: userId,
        product_id: productId,
      });

    if (error) {
      if (error.code === '23505') {
        // Unique constraint violation - déjà en favoris
        console.log('ℹ️ Produit déjà en favoris');
        return false;
      }
      throw error;
    }

    console.log('❤️ Produit ajouté aux favoris');
    return true;
  } catch (error) {
    console.error('❌ Erreur addToWishlist:', error);
    throw error;
  }
}

/**
 * Retire un produit des favoris
 */
export async function removeFromWishlist(
  userId: string,
  productId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('wishlist')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);

    if (error) throw error;
    console.log('🤍 Produit retiré des favoris');
    return true;
  } catch (error) {
    console.error('❌ Erreur removeFromWishlist:', error);
    throw error;
  }
}

/**
 * S'abonne aux changements des favoris en temps réel
 */
export function subscribeToWishlist(
  userId: string,
  callback: (payload: any) => void,
  errorCallback?: (error: Error) => void
) {
  const subscription = supabase
    .channel(`wishlist_${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'wishlist',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        console.log('❤️ Changement des favoris détecté:', payload);
        callback(payload);
      }
    )
    .subscribe((status, err) => {
      if (status === 'SUBSCRIBED') {
        console.log('✅ Souscription favoris en temps réel activée');
      } else if (status === 'CLOSED') {
        console.error('❌ Souscription favoris fermée');
        if (errorCallback) {
          errorCallback(new Error('Souscription favoris fermée'));
        }
      } else if (status === 'CHANNEL_ERROR') {
        console.error('❌ Erreur de canal favoris:', err);
        if (errorCallback) {
          errorCallback(new Error(`Erreur de canal favoris: ${err}`));
        }
      }
    });

  return subscription;
}

/**
 * Vérifie la connexion à Supabase
 */
export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('id')
      .limit(1);

    return !error;
  } catch {
    return false;
  }
}

// ============================================================================
// EXPORT DU CLIENT
// ============================================================================

export default supabase;
