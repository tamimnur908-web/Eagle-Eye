import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShoppingBag } from 'lucide-react';
import { getPublishedProducts } from '../services/firestoreService';
import { DigitalProduct } from '../types';
import { EmptyState } from '../components/EmptyState';
import { useCart } from '../context/CartContext';

export const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<DigitalProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [filterPricing, setFilterPricing] = useState<'all' | 'free' | 'paid'>('all');
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getPublishedProducts();
        setProducts(data);
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const categories = ['All', ...Array.from(new Set(products.map((p) => p.category).filter(Boolean)))];

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      p.tags?.some((t) => t.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;

    let matchesPricing = true;
    if (filterPricing === 'free') matchesPricing = p.price === 0;
    if (filterPricing === 'paid') matchesPricing = p.price > 0;

    return matchesSearch && matchesCategory && matchesPricing;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-widest text-[#2563EB]">
          Premium Digital Assets
        </span>
        <h1 className="text-4xl font-extrabold text-[#08152F]">Digital Product Vault</h1>
        <p className="text-sm text-[#667085] leading-relaxed">
          Streamline your workflow with agency-grade UI kits, social media templates, growth blueprints, and operational toolkits.
        </p>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search templates & assets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#F3F5F9] border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs text-[#172033] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] focus:bg-white transition-colors"
          />
        </div>

        {/* Pricing filter & Categories */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto">
          <select
            value={filterPricing}
            onChange={(e) => setFilterPricing(e.target.value as any)}
            className="bg-[#F3F5F9] border border-slate-300 rounded-lg px-3 py-2 text-xs text-[#172033] focus:outline-none focus:border-[#2563EB] focus:bg-white font-medium"
          >
            <option value="all">All Pricing</option>
            <option value="free">Free Downloads</option>
            <option value="paid">Premium (Paid)</option>
          </select>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 w-full sm:flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs px-3.5 py-1.5 rounded-lg border font-semibold transition-colors shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-[#2563EB] text-white border-[#2563EB]'
                    : 'bg-[#F3F5F9] text-[#667085] border-slate-200 hover:text-[#172033] hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-80 rounded-xl bg-slate-200 animate-pulse border border-slate-200" />
          ))}
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white border border-slate-200 hover:border-[#2563EB] rounded-xl overflow-hidden transition-all group flex flex-col justify-between shadow-sm hover:shadow-md"
            >
              <div>
                <div className="h-48 bg-slate-100 overflow-hidden relative">
                  <img
                    src={product.thumbnailUrl || '/logo.jpg'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-[10px] uppercase font-bold px-2 py-0.5 rounded text-[#2563EB] border border-slate-200 shadow-sm">
                    {product.productType.replace('_', ' ')}
                  </div>
                  <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-[10px] uppercase font-bold px-2.5 py-0.5 rounded text-[#172033] border border-slate-200 shadow-sm">
                    {product.format || 'ZIP'}
                  </span>
                </div>

                <div className="p-6">
                  <span className="text-[11px] font-bold text-[#2563EB] uppercase tracking-wider">
                    {product.category}
                  </span>
                  <h3 className="text-lg font-bold text-[#08152F] mt-1 group-hover:text-[#2563EB] transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-xs text-[#667085] mt-2 line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>

                  {product.tags && product.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {product.tags.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] bg-[#F3F5F9] text-[#667085] px-2 py-0.5 rounded border border-slate-200"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 pt-0 border-t border-slate-100 flex items-center justify-between">
                <div>
                  {product.price === 0 ? (
                    <span className="text-base font-extrabold text-emerald-600">FREE</span>
                  ) : (
                    <div className="flex items-baseline space-x-2">
                      <span className="text-base font-extrabold text-[#08152F]">
                        ৳{product.salePrice ?? product.price}
                      </span>
                      {product.salePrice && (
                        <span className="text-xs text-slate-400 line-through">৳{product.price}</span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Link
                    to={`/products/${product.slug}`}
                    className="px-3 py-1.5 rounded-lg bg-[#F3F5F9] hover:bg-slate-200 text-xs font-semibold text-[#172033] transition-colors"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => addToCart(product)}
                    className="px-3 py-1.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold transition-colors flex items-center space-x-1 shadow-sm"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>{product.price === 0 ? 'Get Free' : 'Add'}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={ShoppingBag}
          title="No Products Found"
          description="We couldn't find any products matching your selected criteria. Try resetting the filters or check back later."
          actionText="Reset Filters"
          onAction={() => {
            setSearch('');
            setSelectedCategory('All');
            setFilterPricing('all');
          }}
        />
      )}
    </div>
  );
};
