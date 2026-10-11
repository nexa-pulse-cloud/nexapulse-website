import React, { useEffect, useMemo, useState } from "react";
import AdminPanel from "./AdminPanel";
import { supabase } from "./lib/supabase";
import {
  ArrowDownRight, ArrowRight, Check, ChevronDown, Headphones, Heart,
  Menu, Minus, Plus, Search, ShieldCheck, ShoppingBag, Smartphone,
  Truck, Watch, X, Zap, SlidersHorizontal, Trash2, MessageCircle, Mail, Phone
} from "lucide-react";
const demoProducts = [
  { id: 1, name: "Pulse Active S1", category: "Smartwatches", price: 2490, oldPrice: 3290, tag: "BESTSELLER", color: "cyan", image: "watch", description: "Fitness tracking, notifications and a bright everyday display." },
  { id: 2, name: "AeroBeat Pro", category: "Headphones", price: 1890, oldPrice: 2490, tag: "POPULAR", color: "violet", image: "headphones", description: "Comfort-fit wireless audio for work, travel and playlists." },

  { id: 3, name: "NexaPods Lite", category: "Headphones", price: 1290, oldPrice: 1690, tag: "NEW", color: "blue", image: "earbuds", description: "Compact true-wireless earbuds with a pocket-friendly case." },
  { id: 4, name: "Volt 20W Charger", category: "Mobile Accessories", price: 790, oldPrice: null, tag: "ESSENTIAL", color: "amber", image: "charger", description: "A compact USB-C charging accessory for compatible devices." },
  { id: 5, name: "PowerCore 10K", category: "Mobile Accessories", price: 1590, oldPrice: 1990, tag: "TRAVEL PICK", color: "green", image: "powerbank", description: "Portable power for busy days and long journeys." },
  { id: 6, name: "Pulse Fit X", category: "Smartwatches", price: 3490, oldPrice: 4290, tag: "FEATURED", color: "pink", image: "watch2", description: "A sleek wearable concept with activity and sleep insights." },
];

const money = (amount) => `৳${amount.toLocaleString("en-BD")}`;

function ProductArt({ type, color }) {
  const classes = {
    cyan: "from-cyan-400/20 via-slate-900 to-blue-950",
    violet: "from-violet-400/20 via-slate-900 to-purple-950",
    blue: "from-blue-400/20 via-slate-900 to-indigo-950",
    amber: "from-amber-300/20 via-slate-900 to-orange-950",
    green: "from-emerald-300/20 via-slate-900 to-green-950",
    pink: "from-pink-300/20 via-slate-900 to-rose-950",
  };
  return <div className={`product-art bg-gradient-to-br ${classes[color] || classes.cyan}`}>
    <div className="art-glow" />
    {type === "watch" || type === "watch2" ? (
      <div className="watch-art">
        <div className="watch-strap" />
        <div className="watch-face"><div className="watch-time">10:08</div><div className="watch-ring"><span>82</span></div><div className="watch-bars"><i/><i/><i/><i/></div></div>
      </div>
    ) : type === "headphones" ? (
      <div className="headphone-art"><div className="headband"/><div className="earcup left"/><div className="earcup right"/></div>
    ) : type === "earbuds" ? (
      <div className="earbuds-art"><div className="earbud e1"/><div className="earbud e2"/><div className="earbud-case"><span/></div></div>
    ) : type === "charger" ? (
      <div className="charger-art"><div className="charger-body"><span/><i/><i/></div><div className="charger-cable"/></div>
    ) : (
      <div className="powerbank-art"><div className="powerbank-body"><div className="power-dots"><i/><i/><i/><i/></div><Zap size={34}/><span>10K</span></div><div className="power-cable"/></div>
    )}
    <span className="art-caption">NEXAPULSE / PRODUCT CONCEPT</span>
  </div>;
}

function Header({ cartCount, onCart, activeCategory, setActiveCategory }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const categories = ["All Products", "Smartwatches", "Headphones", "Mobile Accessories"];
  const choose = (category) => { setActiveCategory(category); setMenuOpen(false); document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" }); };
  return <header className="site-header">
    <div className="announcement"><Zap size={13} className="text-pulse"/> <span>SMART TECH. BETTER LIVING.</span><span className="announcement-divider">·</span><span>Delivery across Bangladesh</span></div>
    <div className="container nav-row">
      <a className="brand" href="#home" aria-label="Nexapulse home"><span className="brand-mark"><Zap size={22} fill="currentColor"/></span><span>NEXA<span className="brand-light">PULSE</span><small>SMART TECH STORE</small></span></a>
      <nav className="desktop-nav" aria-label="Main navigation">
        <a href="#home">Home</a><a href="#shop">Shop</a><a href="#benefits">Why Nexapulse</a><a href="#contact">Contact</a>
      </nav>
      <div className="nav-actions">
        <a className="icon-button search-link" href="#shop" aria-label="Search products"><Search size={19}/></a>
        <button className="icon-button cart-button" onClick={onCart} aria-label={`Open cart with ${cartCount} items`}><ShoppingBag size={19}/><span className="cart-count">{cartCount}</span></button>
        <button className="icon-button mobile-menu" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">{menuOpen ? <X/> : <Menu/>}</button>
      </div>
    </div>
    {menuOpen && <div className="mobile-nav">{categories.map(c => <button key={c} onClick={() => choose(c)}>{c}<ArrowRight size={16}/></button>)}<a href="#benefits" onClick={() => setMenuOpen(false)}>Why Nexapulse</a><a href="#contact" onClick={() => setMenuOpen(false)}>Contact</a></div>}
  </header>;
}

function ProductCard({ product, addToCart, wishlisted, toggleWishlist }) {
  const gallery = Array.isArray(product.image_urls) && product.image_urls.length
    ? product.image_urls
    : product.image_url ? [product.image_url] : [];
  const oldPrice = Number(product.oldPrice ?? product.old_price ?? 0);
  const hasDiscount = oldPrice > Number(product.price);
  const discountPercent = hasDiscount ? Math.round((1 - Number(product.price) / oldPrice) * 100) : 0;
  const whatsappText = `Hello Nexapulse! I want to order: ${product.name}. Price: ${money(Number(product.price))}. Please confirm availability and delivery. ${window.location.origin}`;
  return <article className="product-card">
    <div className="product-image-wrap">
      {gallery.length ? (
        <div className="product-gallery" aria-label={`${product.name} product images`}>
          {gallery.map((src, index) => <img key={src + index} src={src} alt={`${product.name} view ${index + 1}`} loading="lazy" />)}
        </div>
      ) : <ProductArt type={product.image} color={product.color} />}
      <span className="product-tag">{product.tag || "AVAILABLE"}</span>
      <button className={`wishlist ${wishlisted ? "is-loved" : ""}`} onClick={() => toggleWishlist(product.id)} aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}><Heart size={17} fill={wishlisted ? "currentColor" : "none"}/></button>
      {hasDiscount && <span className="discount">{discountPercent}% OFF</span>}
    </div>
    <div className="product-info">
      <div className="product-category">{product.category}</div>
      <h3>{product.name}</h3>
      <p className="product-description">{product.description}</p>
      <div className="product-bottom">
        <div className="price-line"><strong>{money(Number(product.price))}</strong>{hasDiscount && <del>{money(oldPrice)}</del>}</div>
        <button className="add-button" onClick={() => addToCart(product)} aria-label={`Add ${product.name} to cart`}><Plus size={18}/></button>
      </div>
      <div className="product-card-actions">
        <a className="whatsapp-order-button" href={`https://wa.me/8801727874997?text=${encodeURIComponent(whatsappText)}`} target="_blank" rel="noreferrer"><MessageCircle size={15}/> Order on WhatsApp</a>
      </div>
    </div>
  </article>;
}

function CartDrawer({ open, onClose, cart, setCart }) {
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );
const deliveryCharge = cart.length > 0 ? 120 : 0;
const grandTotal = total + deliveryCharge;
const whatsappOrderText = [
  "Hello Nexapulse! I want to place an order:",
  ...cart.map((item) => `- ${item.name} x ${item.qty}: ${money(Number(item.price) * item.qty)}`),
  `Subtotal: ${money(total)}`,
  `Delivery: ${money(deliveryCharge)}`,
  `Total: ${money(grandTotal)}`,
  "Please confirm availability and delivery details."
].join("\n");
  const update = (id, delta) => {
    setCart((old) =>
      old.map((item) =>
        item.id === id
          ? { ...item, qty: Math.max(1, item.qty + delta) }
          : item
      )
    );
  };

  const remove = (id) => {
    setCart((old) => old.filter((item) => item.id !== id));
  };

const [orderError, setOrderError] = useState("");
const [submitting, setSubmitting] = useState(false);

const submitOrder = async (e) => {
  e.preventDefault();
  setOrderError("");

  if (submitting || cart.length === 0) return;

  setSubmitting(true);

  try {
    const form = new FormData(e.currentTarget);

    const customer_name = String(
      form.get("customer_name") || ""
    ).trim();

    const customer_phone = String(
      form.get("customer_phone") || ""
    ).trim();

    const customer_address = String(
      form.get("customer_address") || ""
    ).trim();

    if (!customer_name || !customer_phone || !customer_address) {
      throw new Error("Please complete all delivery details.");
    }

    const { data, error } = await supabase.functions.invoke(
      "place-order",
      {
        body: {
          customer_name,
          customer_phone,
          customer_address,
          payment_method: "COD",
          items: cart.map((item) => ({
            id: item.id,
            qty: item.qty,
          })),
        },
      }
    );

    if (error) {
      throw new Error(error.message || "Order submission failed.");
    }

    if (data?.success !== true) {
      throw new Error(
        data?.error || "The server did not confirm the order."
      );
    }

    setSubmitted(true);
    setCheckoutOpen(false);
  } catch (err) {
    console.error("Order submission failed:", err);
    setOrderError(err.message || "Please try again.");
  } finally {
    setSubmitting(false);
  }
};

  if (!open) return null;

  return (
    <div
      className="drawer-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <aside className="cart-drawer" aria-label="Shopping cart">
        <div className="drawer-head">
          <div>
            <span className="eyebrow">YOUR SELECTION</span>
            <h2>
              Your Cart{" "}
              <span>
                ({cart.reduce((n, item) => n + item.qty, 0)})
              </span>
            </h2>
          </div>

          <button
            className="icon-button"
            onClick={onClose}
            aria-label="Close cart"
          >
            <X />
          </button>
        </div>

        {submitted ? (
          <div className="order-success">
            <span className="success-icon">
              <Check size={28} />
            </span>
            <h3>Order received successfully!</h3>
<p>
  Your order has been submitted successfully.
  Our team will contact you to confirm delivery.
</p>
            <button
              className="primary-button"
              onClick={() => {
                setSubmitted(false);
                setCheckoutOpen(false);
                setCart([]);
                onClose();
              }}
            >
              Continue shopping <ArrowRight size={16} />
            </button>
          </div>
        ) : checkoutOpen ? (
          <form className="checkout-form" onSubmit={submitOrder}>
            <button
              type="button"
              className="back-link"
              onClick={() => setCheckoutOpen(false)}
            >
              ← Back to cart
            </button>

            <h3>Delivery details</h3>
            <p className="muted-copy">
              Enter your delivery details to place your order.
            </p>

            <label>
              Full name
              <input
                name="customer_name"
                required
                placeholder="Your full name"
              />
            </label>

            <label>
              Phone number
              <input
                name="customer_phone"
                required
                type="tel"
                pattern="[0-9+ -]{8,16}"
                placeholder="+8801XXXXXXXXX"
              />
            </label>

            <label>
              Delivery address
              <textarea
                name="customer_address"
                required
                rows={3}
                placeholder="House, road, area, district"
              />
            </label>

            <label>
              Payment method
              <select name="payment_method" defaultValue="cod">
                <option value="cod">Cash on Delivery</option>
              </select>
            </label>

<div className="checkout-total">
  <span>Product subtotal</span>
  <strong>{money(total)}</strong>
</div>

<div className="checkout-total">
  <span>Delivery charge</span>
  <strong>{money(deliveryCharge)}</strong>
</div>

<div className="checkout-total">
  <span>Total payable</span>
  <strong>{money(grandTotal)}</strong>
</div>

            <button
              className="primary-button full-button"
              type="submit"
            >
              Place order <ArrowRight size={16} />
            </button>
          </form>
        ) : (
          <>
            <div className="cart-items">
              {cart.length === 0 ? (
                <div className="empty-cart">
                  <ShoppingBag size={36} />
                  <h3>Your cart is waiting</h3>
                  <p>Add a little smart tech to get started.</p>
                  <button
                    className="primary-button"
                    onClick={onClose}
                  >
                    Explore products <ArrowRight size={16} />
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <div className="cart-item" key={item.id}>
                    <div className="cart-thumb">
                      <ProductArt
                        type={item.image}
                        color={item.color}
                      />
                    </div>

                    <div className="cart-item-content">
                      <span className="product-category">
                        {item.category}
                      </span>
                      <h3>{item.name}</h3>
                      <strong>{money(item.price)}</strong>

                      <div className="qty-control">
                        <button
                          onClick={() =>
                            item.qty === 1
                              ? remove(item.id)
                              : update(item.id, -1)
                          }
                          aria-label="Decrease quantity"
                        >
                          {item.qty === 1 ? (
                            <Trash2 size={13} />
                          ) : (
                            <Minus size={13} />
                          )}
                        </button>

                        <span>{item.qty}</span>

                        <button
                          onClick={() => update(item.id, 1)}
                          aria-label="Increase quantity"
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                    </div>

                    <button
                      className="remove-item"
                      onClick={() => remove(item.id)}
                      aria-label={`Remove ${item.name}`}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="cart-footer">
                <div className="shipping-note">
                  <Truck size={17} />
                  <span>
  Nationwide delivery charge: {money(deliveryCharge)}
</span>
                </div>

                <div className="subtotal">
                  <span>Subtotal</span>
                  <strong>{money(total)}</strong>
                </div>

                <p className="muted-copy">
                  Cash on Delivery is available. Submit your order to request delivery.
                </p>

                <a
                  className="whatsapp-order-button full-button"
                  href={`https://wa.me/8801727874997?text=${encodeURIComponent(whatsappOrderText)}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <MessageCircle size={16} /> Order on WhatsApp
                </a>
                <button
                  type="button"
                  className="primary-button full-button"
                  onClick={() => setCheckoutOpen(true)}
                >
                  Continue to checkout <ArrowRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </aside>
    </div>
  );
}
function App() {
  
  const [products, setProducts] = useState(demoProducts);

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase product loading error:", error);
        return;
      }

      if (!cancelled && data) {
        if (data.length === 0) {
          setProducts(demoProducts);
        } else {
          setProducts(
            data.map((p) => ({
              ...p,
              oldPrice: p.old_price ?? null,
              tag: "AVAILABLE",
              color: "cyan",
              image:
                p.category === "Smartwatches"
                  ? "watch"
                  : p.category === "Headphones"
                  ? "headphones"
                  : "charger",
            }))
          );
        }
      }
    }

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  const [activeCategory, setActiveCategory] = useState("All Products");
  const [sort, setSort] = useState("featured");
  const [search, setSearch] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [toast, setToast] = useState("");
  const categories = [
    {name:"Smartwatches", count:"Wear it your way", icon:Watch, number:"01"},
    {name:"Headphones", count:"Find your sound", icon:Headphones, number:"02"},
    {name:"Mobile Accessories", count:"Power every day", icon:Smartphone, number:"03"},
  ];
  const visibleProducts = useMemo(() => {
    let list = products.filter(p => (activeCategory === "All Products" || p.category === activeCategory) && (p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase())));
    if (sort === "low") list.sort((a,b)=>a.price-b.price);
    if (sort === "high") list.sort((a,b)=>b.price-a.price);
    if (sort === "name") list.sort((a,b)=>a.name.localeCompare(b.name));
    return list;
  }, [products, activeCategory, sort, search]);
  const addToCart = (product) => {
    setCart(old => old.some(i=>i.id===product.id) ? old.map(i=>i.id===product.id?{...i,qty:i.qty+1}:i) : [...old,{...product,qty:1}]);
    setToast(`${product.name} added to cart`);
    window.setTimeout(() => setToast(""), 2300);
  };
  const toggleWishlist = (id) => setWishlist(old => old.includes(id) ? old.filter(i=>i!==id) : [...old,id]);
  const selectCategory = (category) => { setActiveCategory(category); document.getElementById("shop")?.scrollIntoView({behavior:"smooth"}); };
 
  const cartCount = cart.reduce((n,i)=>n+i.qty,0);

  if (window.location.pathname === "/admin") {
    return <AdminPanel />;
  }

  return <div className="app-shell">

    <Header cartCount={cartCount} onCart={() => setCartOpen(true)} activeCategory={activeCategory} setActiveCategory={setActiveCategory}/>
    <main>
      <section className="hero-section" id="home">
        <div className="hero-grid container">
          <div className="hero-copy">
            <div className="hero-kicker"><span className="live-dot"/> THE NEXT WAVE OF EVERYDAY TECH</div>
            <h1>Make every<br/>moment <span>smarter.</span></h1>
            <p className="hero-description">Thoughtful tech for your everyday rhythm. Discover smartwatches, immersive audio and mobile essentials — all in one place.</p>
            <div className="hero-actions"><a href="#shop" className="primary-button">Explore the collection <ArrowRight size={17}/></a><a href="#categories" className="text-button">Discover categories <ArrowDownRight size={17}/></a></div>
            <div className="hero-proof"><div className="proof-icon"><Truck size={17}/></div><div><strong>Nationwide delivery</strong><span>Across Bangladesh</span></div><div className="proof-separator"/><div className="proof-icon"><ShieldCheck size={17}/></div><div><strong>Support that helps</strong><span>We're here for you</span></div></div>
          </div>
          <div className="hero-visual">
            <div className="visual-orbit orbit-one"/><div className="visual-orbit orbit-two"/>
            <div className="hero-visual-label label-top"><span>01 / WEARABLES</span><span>PRECISION IN MOTION</span></div>
            <div className="hero-product hero-watch"><ProductArt type="watch" color="cyan"/></div>
            <div className="hero-product hero-headphones"><ProductArt type="headphones" color="violet"/></div>
            <div className="hero-product hero-earbuds"><ProductArt type="earbuds" color="blue"/></div>
            <div className="floating-chip chip-one"><Zap size={14}/> Everyday innovation</div><div className="floating-chip chip-two">N / 01 <span>DESIGNED FOR YOUR DAY</span></div>
            <div className="visual-bottom"><span>TECH THAT MOVES WITH YOU</span><span>EST. FOR EVERYDAY</span></div>
          </div>
        </div>
        <div className="hero-bottom-line"><span>SMART TECH.</span><span>BETTER LIVING.</span><span>NEXAPULSE®</span></div>
      </section>

      <section className="category-section section-pad" id="categories">
        <div className="container">
          <div className="section-heading"><div><span className="eyebrow">CURATED FOR YOUR EVERYDAY</span><h2>Find your <span>next favorite.</span></h2></div><p>Small upgrades. Better routines. Explore the essentials that keep you connected.</p></div>
          <div className="category-grid">{categories.map(({name,count,icon:Icon,number})=><button className="category-card" key={name} onClick={()=>selectCategory(name)}><div className="category-top"><span>{number} / 03</span><ArrowDownRight size={18}/></div><div className="category-icon"><Icon size={31} strokeWidth={1.5}/></div><div className="category-bottom"><div><h3>{name}</h3><p>{count}</p></div><span className="round-arrow"><ArrowRight size={17}/></span></div></button>)}</div>
        </div>
      </section>

      <section className="shop-section section-pad" id="shop">
        <div className="container">
          <div className="section-heading shop-heading"><div><span className="eyebrow">THE NEXAPULSE EDIT</span><h2>Everyday tech, <span>elevated.</span></h2></div><p>Explore our collection of useful tech essentials, chosen for your daily routine.</p></div>
          <div className="shop-toolbar"><div className="filter-tabs">{["All Products","Smartwatches","Headphones","Mobile Accessories"].map(c=><button key={c} className={activeCategory===c?"active":""} onClick={()=>setActiveCategory(c)}>{c}</button>)}</div><div className="shop-controls"><label className="search-field"><Search size={16}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Find your tech..." aria-label="Search products"/>{search && <button onClick={()=>setSearch("")} aria-label="Clear search"><X size={14}/></button>}</label><label className="sort-select"><SlidersHorizontal size={15}/><select value={sort} onChange={e=>setSort(e.target.value)} aria-label="Sort products"><option value="featured">Featured</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option><option value="name">Name A–Z</option></select><ChevronDown size={14}/></label></div></div>
          <div className="results-line"><span>{visibleProducts.length} products to explore</span><span><span className="green-dot"/> Available in our demo collection</span></div>
          {visibleProducts.length ? <div className="product-grid">{visibleProducts.map(p=><ProductCard key={p.id} product={p} addToCart={addToCart} wishlisted={wishlist.includes(p.id)} toggleWishlist={toggleWishlist}/>)}</div> : <div className="no-results"><Search size={28}/><h3>No products found</h3><p>Try another search or category.</p><button className="secondary-button" onClick={()=>{setSearch("");setActiveCategory("All Products")}}>Clear filters</button></div>}
          <div className="demo-disclaimer"><ShieldCheck size={17}/><p><strong>Product demo:</strong> Product names, illustrations, prices and discounts on this site are sample placeholders for the website preview. Replace them with verified products, real photos, stock and prices before launch.</p></div>
        </div>
      </section>

      <section className="brand-promise section-pad" id="benefits">
        <div className="container promise-grid"><div className="promise-copy"><span className="eyebrow">THE NEXAPULSE PROMISE</span><h2>Good tech should<br/>feel <span>effortless.</span></h2><p>We believe everyday technology should be useful, accessible and easy to choose. Nexapulse brings your daily essentials together in one simple shopping experience.</p><a href="#shop" className="text-button">Shop the collection <ArrowRight size={17}/></a></div><div className="promise-points"><div className="promise-point"><span className="promise-number">01</span><div><h3>Useful by design</h3><p>Everyday accessories picked for practical routines.</p></div><ArrowDownRight size={19}/></div><div className="promise-point"><span className="promise-number">02</span><div><h3>Shopping made simple</h3><p>Clear categories and an easy-to-use shopping flow.</p></div><ArrowDownRight size={19}/></div><div className="promise-point"><span className="promise-number">03</span><div><h3>Bangladesh-wide reach</h3><p>Designed for customers from Dhaka to every district.</p></div><ArrowDownRight size={19}/></div></div></div>
      </section>

      <section className="contact-section section-pad" id="contact"><div className="container contact-panel"><div><span className="eyebrow">NEED A HAND?</span><h2>Let's talk <span>tech.</span></h2><p>Questions about a product or an order? Get in touch with Nexapulse.</p></div><div className="contact-links"><a href="tel:+8801727874997"><span><Phone size={18}/></span><div><small>CALL US</small><strong>+880 1727-874997</strong></div><ArrowRight size={17}/></a><a href="mailto:khalidmutasimsaad@gmail.com"><span><Mail size={18}/></span><div><small>EMAIL US</small><strong>khalidmutasimsaad@gmail.com</strong></div><ArrowRight size={17}/></a><a href="https://wa.me/8801727874997" target="_blank" rel="noreferrer"><span><MessageCircle size={18}/></span><div><small>WHATSAPP</small><strong>Chat with Nexapulse</strong></div><ArrowRight size={17}/></a></div></div></section>
    </main>
    <footer className="site-footer"><div className="container footer-main"><a className="brand" href="#home"><span className="brand-mark"><Zap size={22} fill="currentColor"/></span><span>NEXA<span className="brand-light">PULSE</span><small>SMART TECH STORE</small></span></a><p>Smart tech for the rhythm of real life.</p><div className="footer-links"><a href="#shop">Shop</a><a href="#benefits">Our promise</a><a href="#contact">Contact</a></div></div><div className="container footer-bottom"><span>© {new Date().getFullYear()} Nexapulse. All rights reserved.</span><span>Made for everyday momentum <Zap size={13}/></span></div><div className="container footer-demo-note">Demo storefront only · Prices, product visuals, discounts and order flow are placeholders. No payment gateway, inventory or order backend is connected.</div></footer>
    {toast && <div className="toast"><Check size={17}/>{toast}<button onClick={()=>setCartOpen(true)}>View cart</button></div>}
    <CartDrawer open={cartOpen} onClose={()=>setCartOpen(false)} cart={cart} setCart={setCart}/>
    <a className="floating-cart" href="#shop" onClick={e=>{e.preventDefault();setCartOpen(true)}} aria-label="Open shopping cart"><ShoppingBag size={20}/><span>{cartCount}</span></a>
  </div>;
}

export default App;
