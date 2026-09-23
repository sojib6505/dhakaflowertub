import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Menu,
  MessageCircle,
  MoveRight,
  Play,
  Search,
  X,
} from "lucide-react";
import ProductDetailsModal from "./components/ProductDetailsModal";
import { API_URL, BUSINESS_VIDEO, CORPORATE_IMAGES } from "./config/api";
import { getWhatsAppLink } from "./utils/whatsapp";
import "./App.css";
import Logo from "./components/Logo";

const formatPrice = (product) => {
  if (product.priceDisplay) return product.priceDisplay;
  if (product.isPriceCustom || !product.price) return "Price on request";
  return `৳ ${product.price.toLocaleString()}`;
};

function App() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(["All Collections"]);
  const [activeCategory, setActiveCategory] = useState("All Collections");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeCorporateImage, setActiveCorporateImage] = useState(0);
  const [autoPlayCorporateImages, setAutoPlayCorporateImages] = useState(true);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  useEffect(() => {
    const loadCatalogue = async () => {
      try {
        const [productResponse, categoryResponse] = await Promise.all([
          fetch(`${API_URL}/products`),
          fetch(`${API_URL}/products/categories`),
        ]);

        if (!productResponse.ok || !categoryResponse.ok) {
          throw new Error("The catalogue is temporarily unavailable.");
        }

        const productPayload = await productResponse.json();
        const categoryPayload = await categoryResponse.json();
        setProducts(productPayload.data || []);
        setCategories(categoryPayload.data || ["All Collections"]);
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadCatalogue();
  }, []);

  const visibleProducts = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();
    return products.filter((product) => {
      const matchesCategory =
        activeCategory === "All Collections" ||
        product.category === activeCategory;
      const searchableText =
        `${product.name} ${product.shortDescription} ${product.category}`.toLowerCase();
      return (
        matchesCategory && (!searchTerm || searchableText.includes(searchTerm))
      );
    });
  }, [activeCategory, products, search]);

  const featuredProduct =
    products.find((product) => product.isFeatured) || products[0];

  useEffect(() => {
    if (!autoPlayCorporateImages) return undefined;

    const sliderInterval = window.setInterval(() => {
      setActiveCorporateImage((currentIndex) => {
        const nextIndex = (currentIndex + 1) % CORPORATE_IMAGES.length;
        return nextIndex;
      });
    }, 5000);

    return () => window.clearInterval(sliderInterval);
  }, [autoPlayCorporateImages]);

  const currentCorporateImage = CORPORATE_IMAGES[activeCorporateImage];

  const moveCorporateImage = (direction) => {
    setAutoPlayCorporateImages(false);
    setActiveCorporateImage((currentIndex) => {
      const nextIndex =
        (currentIndex + direction + CORPORATE_IMAGES.length) %
        CORPORATE_IMAGES.length;
      return nextIndex;
    });
  };

  return (
    <div className="site-shell">
      <header className="site-header">
        <a href="#top" aria-label="Dhaka Flower Tub home">
          <Logo />   
        </a>
        <nav
          className={menuOpen ? "main-nav is-open" : "main-nav"}
          aria-label="Main navigation"
        >
          <a href="#collection" onClick={() => setMenuOpen(false)}>
            Collection
          </a>
          <a href="#story" onClick={() => setMenuOpen(false)}>
            Our approach
          </a>
          <a href="#contact" onClick={() => setMenuOpen(false)}>
            Contact
          </a>
        </nav>
        <a
          className="header-cta"
          href={getWhatsAppLink()}
          target="_blank"
          rel="noreferrer"
        >
          <MessageCircle size={16} /> Enquire on WhatsApp
        </a>
        <button
          className="menu-button"
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      <main id="top">
        <section className="hero-section">
          <div className="hero-copy">
            <p className="eyebrow">Cultivated forms for considered spaces</p>
            <h1>
              Bring a little <em>earth</em> home.
            </h1>
            <p className="hero-intro">
              Architectural flower tubs and planters, cast and finished by hand
              for homes, hospitality, and the spaces in between.
            </p>
            <a className="text-link" href="#collection">
              Explore the collection <MoveRight size={17} />
            </a>
          </div>
          <div className="">
            <img
              src={featuredProduct?.images?.[0]?.url}
              alt={
                featuredProduct?.images?.[0]?.alt ||
                "A sculptural flower tub with greenery"
              }
            />
            {/* <div className="hero-note">
              <span>01</span>
              <span>
                Designed in Dhaka
                <br />
                made to last
              </span>
            </div> */}
          </div>
        </section>


        <section className="collection-section" id="collection">
          <div className="section-heading">
            <div>
              <p className="eyebrow">The current edit</p>
              <h2>Find your form.</h2>
            </div>
            <p>
              Small-batch pieces for indoor corners, open-air terraces, and
              everywhere you want a little more life.
            </p>
          </div>
          <div className="catalogue-controls">
            <div
              className="category-tabs"
              role="tablist"
              aria-label="Filter by collection"
            >
              {categories.map((category) => (
                <button
                  className={
                    activeCategory === category
                      ? "category-tab active"
                      : "category-tab"
                  }
                  type="button"
                  role="tab"
                  aria-selected={activeCategory === category}
                  onClick={() => setActiveCategory(category)}
                  key={category}
                >
                  {category}
                </button>
              ))}
            </div>
            <label className="search-field">
              <Search size={17} />
              <span className="sr-only">Search the collection</span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search forms"
              />
            </label>
          </div>
          {isLoading && (
            <p className="catalogue-message">Loading the collection...</p>
          )}
          {error && (
            <p className="catalogue-message error-message">
              {error} Make sure the API is running on port 5000.
            </p>
          )}
          {!isLoading && !error && visibleProducts.length === 0 && (
            <p className="catalogue-message">
              No pieces match that search yet.
            </p>
          )}
          <div className="product-grid">
            {visibleProducts.map((product, index) => (
              <article
                className="product-card"
                key={product._id || product.slug}
              >
                <div className="product-image">
                  <img
                    src={product.images?.[0]?.url}
                    alt={product.images?.[0]?.alt || product.name}
                    loading={index > 1 ? "lazy" : "eager"}
                  />
                  {product.badge && (
                    <span className="product-badge">{product.badge}</span>
                  )}
                </div>
                <div className="product-info">
                  <div>
                    <p className="product-category">{product.category}</p>
                    <h3>{product.name}</h3>
                  </div>
                  <p className="product-price">{formatPrice(product)}</p>
                </div>
                <p className="product-description">
                  {product.shortDescription}
                </p>
                <div className="product-actions">
                  <button
                    className="view-details-button"
                    type="button"
                    onClick={() => setSelectedProduct(product)}
                  >
                    View details <ArrowUpRight size={15} />
                  </button>
                  <a
                    className="product-contact-button"
                    href={getWhatsAppLink(product)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <MessageCircle size={15} /> Contact
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>
        <section className="intro-strip" id="story">
          <p className="section-label">The Dhaka Flower Tub standard</p>
          <p className="intro-statement">
            Good planters do more than hold a plant. They give a room its
            rhythm, soften its edges, and make space for slower moments.
          </p>
          <a
            className="circle-link"
            href={getWhatsAppLink()}
            target="_blank"
            rel="noreferrer"
            aria-label="Talk to Dhaka Flower Tub on WhatsApp"
          >
            <ArrowUpRight size={22} />
          </a>
        </section>

        <section
          className="mx-auto max-w-290 px-[8vw] pb-20 md:px-0 md:pb-30"
          aria-labelledby="business-video-title"
        >
          <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-[minmax(0,1fr)_minmax(320px,0.85fr)] md:gap-16 lg:gap-24">
            {/*  LEFT  — CONTENT */}
            <div className="flex flex-col md:pb-8">
              <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.16em] text-(--green)">
                Our Business
              </p>

              <h2
                id="business-video-title"
                className="max-w-140 font-serif text-[clamp(42px,5vw,67px)] font-medium leading-none tracking-tighter"
              >
                Get to Know the Business Behind the Products
              </h2>

              <p className="mt-6 max-w-[320px] text-[13px] leading-[1.7] text-(--muted)">
                Discover our story, capabilities, products, and the people
                behind the business.
              </p>

            </div>

            {/* RIGHT— VIDEO */}
            <div className="w-full">
              <div className="w-full overflow-hidden rounded-[20px] bg-black md:rounded-3xl">
                <video
                  className="block aspect-9/12 h-full w-full object-cover md:aspect-4/5"
                  controls
                  playsInline
                  preload="metadata"
                  src={BUSINESS_VIDEO.url}
                >
                  Your browser does not support the video tag.
                </video>
              </div>

              {/* <div className="mt-4 flex items-center gap-5 text-[10px] uppercase tracking-[0.12em] text-(--muted)">
                <span className="font-serif text-2xl tracking-normal text-(--green)">
                  01
                </span>

                <span>Business Film</span>
              </div> */}
            </div>
          </div>
        </section>

        <section
          className="corporate-section"
          aria-labelledby="corporate-corner-title"
          onMouseEnter={() => setAutoPlayCorporateImages(false)}
          onMouseLeave={() => setAutoPlayCorporateImages(true)}
        >
          <div className="section-heading corporate-heading">
            <div>
              <p className="eyebrow">Corporate Corner</p>
              <h2 id="corporate-corner-title">
                Built for Business. Designed for Growth.
              </h2>
            </div>
            <p>
              A visual look into our corporate presence, people, products, and
              the environment behind our business.
            </p>
          </div>

          <div className="corporate-slider" aria-label="Corporate image slider">
            <div className="corporate-slider-frame">
              <img
                key={currentCorporateImage.src}
                src={currentCorporateImage.src}
                alt={currentCorporateImage.alt}
                className="corporate-slide-image"
              />
            </div>

            <div className="corporate-slider-controls">
              <button
                type="button"
                className="corporate-slider-nav"
                aria-label="Previous corporate image"
                onClick={() => moveCorporateImage(-1)}
              >
                <ChevronLeft size={18} />
              </button>

              <div
                className="corporate-slider-dots"
                aria-label="Select image slide"
              >
                {CORPORATE_IMAGES.map((image, index) => (
                  <button
                    key={`${image.src}-${index}`}
                    type="button"
                    className={
                      activeCorporateImage === index
                        ? "corporate-slider-dot is-active"
                        : "corporate-slider-dot"
                    }
                    aria-label={`View corporate image ${index + 1}`}
                    onClick={() => {
                      setAutoPlayCorporateImages(false);
                      setActiveCorporateImage(index);
                    }}
                  />
                ))}
              </div>

              <button
                type="button"
                className="corporate-slider-nav"
                aria-label="Next corporate image"
                onClick={() => moveCorporateImage(1)}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </section>
        {/* <section className="business-video-section" aria-labelledby="business-video-title">
          <div className="section-heading business-video-heading">
            <div>
              <p className="eyebrow">Our Business</p>
              <h2 id="business-video-title">Get to Know the Business Behind the Products</h2>
            </div>
            <p>
              Discover our story, capabilities, products, and the people behind
              the business.
            </p>
          </div>

          <div className="video-shell">
            {isVideoPlaying ? (
              <video
                className="business-video"
                controls
                playsInline
                preload="metadata"
                poster={BUSINESS_VIDEO.poster}
                src={BUSINESS_VIDEO.url}
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <button
                type="button"
                className="video-poster"
                onClick={() => setIsVideoPlaying(true)}
                aria-label="Play company video"
              >
                <img src={BUSINESS_VIDEO.poster} alt="Business video preview" />
                <span className="video-overlay" aria-hidden="true">
                  <span className="video-play-button">
                    <Play size={18} />
                  </span>
                  <span className="video-label">Watch the business film</span>
                </span>
              </button>
            )}
          </div>
        </section> */}

        <section className="contact-section" id="contact">
          <div>
            <p className="eyebrow">Have a space in mind?</p>
            <h2>Let’s find the right piece for it.</h2>
          </div>
          <a
            className="contact-button"
            href={getWhatsAppLink()}
            target="_blank"
            rel="noreferrer"
          >
            <MessageCircle size={19} /> Start a conversation{" "}
            <ArrowUpRight size={17} />
          </a>
        </section>
      </main>
      <footer className="site-footer">
        <span>© {new Date().getFullYear()} Dhaka Flower Tub</span>
        <span>Made for spaces with room to grow.</span>
      </footer>
      <ProductDetailsModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}

export default App;
