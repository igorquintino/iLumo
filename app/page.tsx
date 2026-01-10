
'use client';

import React, { useState, useMemo } from 'react';
import { 
  ShoppingCart, Search, Star, Clock, MapPin, ChevronLeft, 
  Trash2, Gift, CheckCircle2, Loader2, CreditCard, Zap, X
} from 'lucide-react';
import { Product, CartItem, CustomerData, ShippingState } from './types';
import { STORE, CATEGORIES, PRODUCTS } from './constants';

export default function Home() {
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[1].id);
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartStep, setCartStep] = useState<'items' | 'checkout'>('items');
  const [isPaying, setIsPaying] = useState(false);
  const [note, setNote] = useState('');

  // Estados do Cupom / Raspadinha
  const [couponCode, setCouponCode] = useState('');
  const [couponStatus, setCouponStatus] = useState<{msg: string, type: 'success' | 'error' | null}>({msg: '', type: null});
  const [appliedDiscount, setAppliedDiscount] = useState<{type: string, value: number} | null>(null);

  const [customer, setCustomer] = useState<CustomerData>({
    name: '', whatsapp: '', city: 'Conselheiro Lafaiete - MG',
    neighborhood: '', street: '', number: '', complement: ''
  });

  const [shipping, setShipping] = useState<ShippingState>({
    fee: null, loading: false, calculated: false
  });

  const itemsTotal = useMemo(() => 
    cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  , [cart]);

  const discountValue = useMemo(() => {
    if (!appliedDiscount) return 0;
    if (appliedDiscount.type === 'percent') return (itemsTotal * appliedDiscount.value) / 100;
    return 0;
  }, [itemsTotal, appliedDiscount]);

  const deliveryFee = useMemo(() => {
    if (appliedDiscount?.type === 'freeShipping') return 0;
    return shipping.fee || 0;
  }, [shipping.fee, appliedDiscount]);

  const finalTotal = itemsTotal - discountValue + deliveryFee;

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => setCart(prev => prev.filter(i => i.id !== id));

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i));
  };

  const handleValidateCoupon = async () => {
    if (!couponCode) return;
    try {
      const res = await fetch('/api/validate-coupon', {
        method: 'POST',
        body: JSON.stringify({ code: couponCode.toUpperCase() })
      });
      const data = await res.json();
      if (data.ok) {
        setCouponStatus({ msg: `🎉 ${data.coupon.label}`, type: 'success' });
        setAppliedDiscount({ type: data.coupon.type, value: data.coupon.value || 0 });
      } else {
        setCouponStatus({ msg: `❌ ${data.message}`, type: 'error' });
        setAppliedDiscount(null);
      }
    } catch {
      setCouponStatus({ msg: 'Erro ao validar', type: 'error' });
    }
  };

  const calculateShipping = async () => {
    if (!customer.neighborhood || !customer.street) return alert("Preencha o endereço completo.");
    setShipping(s => ({ ...s, loading: true }));
    try {
      const res = await fetch('/api/calculate-distance', {
        method: 'POST',
        body: JSON.stringify({ address: `${customer.street}, ${customer.neighborhood}, ${customer.city}` })
      });
      const data = await res.json();
      if (res.ok) setShipping({ fee: data.price, loading: false, calculated: true });
    } catch {
      alert("Erro ao calcular frete");
    } finally {
      setShipping(s => ({ ...s, loading: false }));
    }
  };

  const filteredProducts = PRODUCTS.filter(p => 
    (p.category === activeCategory || searchQuery !== '') &&
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-violet-600 rounded-xl overflow-hidden shadow-lg shadow-violet-200">
              <img src={STORE.logoUrl} className="w-full h-full object-cover" alt="Logo" />
            </div>
            <div>
              <h1 className="text-lg font-black text-violet-950 leading-none">{STORE.name}</h1>
              <span className="text-[10px] font-bold text-violet-500 uppercase tracking-widest">Premium Açaí</span>
            </div>
          </div>
          <button 
            onClick={() => { setIsCartOpen(true); setCartStep('items'); }}
            className="bg-violet-600 text-white px-5 py-2.5 rounded-2xl font-bold shadow-xl shadow-violet-200 flex items-center gap-2 active:scale-95 transition-all"
          >
            <ShoppingCart size={18} />
            <span className="text-sm">{cart.length}</span>
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 space-y-6">
        {/* Banner */}
        <section className="relative h-60 rounded-[32px] overflow-hidden shadow-2xl group">
          <img src={STORE.bannerUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" alt="Banner" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          <div className="absolute bottom-6 left-6 text-white">
            <div className="flex items-center gap-2 text-xs font-bold opacity-80 mb-1">
              <Star size={12} className="text-amber-400 fill-amber-400" />
              <span>{STORE.rating} ({STORE.reviewsCount} avaliações)</span>
            </div>
            <h2 className="text-3xl font-black">{STORE.tagline}</h2>
          </div>
        </section>

        {/* Info Bar */}
        <div className="flex items-center justify-between px-2 text-slate-500 font-bold text-[10px] uppercase tracking-wider">
          <span className="flex items-center gap-1.5"><Clock size={14} className="text-violet-500" /> {STORE.hours}</span>
          <span className="flex items-center gap-1.5"><MapPin size={14} className="text-violet-500" /> {STORE.distance}</span>
          <span className="text-violet-700 font-black">Min. R$ {STORE.minOrder.toFixed(2)}</span>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
          <input 
            type="text" 
            placeholder="Qual será o seu pedido de hoje?" 
            className="w-full bg-white border border-slate-200 rounded-[24px] py-4 pl-12 pr-4 font-medium focus:ring-4 focus:ring-violet-500/10 transition-all outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar -mx-4 px-4 sticky top-[64px] z-30 bg-slate-50/80 backdrop-blur-md">
          {CATEGORIES.map(cat => (
            <button 
              key={cat.id} 
              onClick={() => setActiveCategory(cat.id)}
              className={`whitespace-nowrap px-6 py-3 rounded-2xl text-sm font-bold transition-all ${activeCategory === cat.id ? 'bg-violet-600 text-white shadow-lg' : 'bg-white text-slate-500 shadow-sm'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Products */}
        <div className="grid gap-4">
          {filteredProducts.map(product => (
            <div 
              key={product.id} 
              className="bg-white p-4 rounded-[28px] shadow-sm border border-slate-100 flex gap-4 cursor-pointer hover:shadow-xl transition-all active:scale-[0.98]"
              onClick={() => addToCart(product)}
            >
              <div className="flex-1 space-y-2">
                {product.isPopular && <span className="inline-block bg-violet-100 text-violet-700 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">Favorito</span>}
                <h4 className="text-lg font-extrabold text-slate-900 leading-tight">{product.name}</h4>
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{product.description}</p>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-lg font-black text-violet-700">R$ {product.price.toFixed(2)}</span>
                  <div className="w-8 h-8 bg-violet-50 rounded-xl flex items-center justify-center text-violet-600"><Zap size={16} /></div>
                </div>
              </div>
              <div className="w-28 h-28 rounded-2xl overflow-hidden flex-shrink-0 bg-slate-100">
                <img src={product.image} className="w-full h-full object-cover" alt={product.name} />
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-[10px] text-slate-300 font-bold uppercase tracking-[0.2em] py-10">
          © 2024 • Roxo Sabor Premium Delivery
        </p>
      </main>

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-md" onClick={() => setIsCartOpen(false)} />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-up sm:animate-none">
            <div className="p-6 border-b flex items-center justify-between">
              <button onClick={() => cartStep === 'checkout' ? setCartStep('items') : setIsCartOpen(false)} className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:text-violet-600 transition-colors">
                <ChevronLeft size={24} />
              </button>
              <h2 className="text-xl font-black text-slate-900">{cartStep === 'items' ? 'Minha Sacola' : 'Finalizar'}</h2>
              <div className="w-10" />
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-300 space-y-4 opacity-50 grayscale">
                  <ShoppingCart size={64} />
                  <p className="font-bold uppercase text-xs tracking-widest">Sua sacola está vazia</p>
                </div>
              ) : cartStep === 'items' ? (
                <>
                  <div className="space-y-4">
                    {cart.map(item => (
                      <div key={item.id} className="flex gap-4 p-4 bg-slate-50 rounded-[24px]">
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-white shadow-sm flex-shrink-0">
                          <img src={item.image} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between font-bold text-slate-900 mb-1">
                            <h4 className="text-sm truncate w-32">{item.name}</h4>
                            <button onClick={() => removeFromCart(item.id)} className="text-slate-300 hover:text-rose-500"><X size={16} /></button>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 bg-white px-2 py-1 rounded-lg border border-slate-100 shadow-sm">
                              <button onClick={() => updateQuantity(item.id, -1)} className="text-violet-600 font-black">-</button>
                              <span className="text-xs font-black">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.id, 1)} className="text-violet-600 font-black">+</button>
                            </div>
                            <span className="text-sm font-black text-violet-700">R$ {(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Raspadinha restored */}
                  <div className="bg-gradient-to-br from-violet-50 to-fuchsia-50 p-5 rounded-[28px] border border-violet-100 space-y-3">
                    <div className="flex items-center gap-2">
                      <Gift size={20} className="text-violet-600" />
                      <span className="text-xs font-black uppercase tracking-tight text-violet-800">Raspadinha Premiada</span>
                    </div>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="CÓDIGO" 
                        className="flex-1 bg-white border border-violet-200 rounded-xl px-4 py-2 text-sm font-bold uppercase outline-none focus:ring-2 focus:ring-violet-400"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                      />
                      <button onClick={handleValidateCoupon} className="bg-violet-600 text-white px-4 rounded-xl text-xs font-black">OK</button>
                    </div>
                    {couponStatus.msg && <p className={`text-[10px] font-bold text-center ${couponStatus.type === 'success' ? 'text-green-600' : 'text-rose-600'}`}>{couponStatus.msg}</p>}
                  </div>

                  <textarea 
                    placeholder="Alguma observação? (ex: tirar granola)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm outline-none focus:ring-4 focus:ring-violet-500/5 min-h-[100px] resize-none"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Identificação</h3>
                    <input type="text" placeholder="Nome" className="w-full bg-slate-50 border rounded-xl p-4 font-bold text-sm" value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})} />
                    <input type="text" placeholder="WhatsApp" className="w-full bg-slate-50 border rounded-xl p-4 font-bold text-sm" value={customer.whatsapp} onChange={e => setCustomer({...customer, whatsapp: e.target.value})} />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Endereço</h3>
                    <input type="text" placeholder="Bairro" className="w-full bg-slate-50 border rounded-xl p-4 font-bold text-sm" value={customer.neighborhood} onChange={e => setCustomer({...customer, neighborhood: e.target.value})} />
                    <input type="text" placeholder="Rua / Avenida" className="w-full bg-slate-50 border rounded-xl p-4 font-bold text-sm" value={customer.street} onChange={e => setCustomer({...customer, street: e.target.value})} />
                    <div className="flex gap-3">
                      <input type="text" placeholder="Nº" className="w-1/3 bg-slate-50 border rounded-xl p-4 font-bold text-sm" value={customer.number} onChange={e => setCustomer({...customer, number: e.target.value})} />
                      <input type="text" placeholder="Comp." className="flex-1 bg-slate-50 border rounded-xl p-4 font-bold text-sm" value={customer.complement} onChange={e => setCustomer({...customer, complement: e.target.value})} />
                    </div>
                    <button onClick={calculateShipping} disabled={shipping.loading} className="w-full bg-white border-2 border-violet-100 text-violet-600 py-4 rounded-2xl font-black text-sm shadow-sm flex items-center justify-center gap-2 hover:border-violet-600 transition-all">
                      {shipping.loading ? <Loader2 className="animate-spin" /> : <MapPin size={18} />}
                      {shipping.loading ? 'Calculando...' : 'Calcular Frete'}
                    </button>
                  </div>
                  {shipping.calculated && (
                    <div className="bg-green-50 border border-green-100 p-4 rounded-2xl flex justify-between items-center animate-pop">
                      <span className="text-xs font-bold text-green-700">Taxa de Entrega</span>
                      <span className="font-black text-green-800">R$ {deliveryFee.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-8 bg-white border-t space-y-4 shadow-[0_-20px_40px_-15px_rgba(0,0,0,0.1)]">
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <span>Subtotal</span>
                    <span>R$ {itemsTotal.toFixed(2)}</span>
                  </div>
                  {discountValue > 0 && (
                    <div className="flex justify-between text-[10px] font-black text-rose-500 uppercase tracking-widest">
                      <span>Desconto</span>
                      <span>- R$ {discountValue.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-2xl font-black text-slate-900 pt-2 border-t mt-2">
                    <span>Total</span>
                    <span className="text-violet-700">R$ {finalTotal.toFixed(2)}</span>
                  </div>
                </div>

                {cartStep === 'items' ? (
                  <button onClick={() => setCartStep('checkout')} className="w-full bg-violet-600 text-white py-5 rounded-[24px] font-black text-lg shadow-2xl shadow-violet-300 active:scale-95 transition-all">Finalizar Pedido</button>
                ) : (
                  <button disabled={!shipping.calculated || !customer.name || isPaying} className="w-full bg-violet-600 text-white py-5 rounded-[24px] font-black text-lg shadow-2xl shadow-violet-300 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 transition-all">
                    {isPaying ? <Loader2 className="animate-spin" /> : <CreditCard />} Pagar Agora
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
