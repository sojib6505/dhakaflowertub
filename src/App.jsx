import { useEffect, useMemo, useState } from 'react'
import { ArrowUpRight, Menu, MessageCircle, MoveRight, Search, X } from 'lucide-react'
import ProductDetailsModal from './components/ProductDetailsModal'
import { getWhatsAppLink } from './utils/whatsapp'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || 'https://dhakaflowertub.onrender.com/api'

const formatPrice = (product) => {
  if (product.priceDisplay) return product.priceDisplay
  if (product.isPriceCustom || !product.price) return 'Price on request'
  return `৳ ${product.price.toLocaleString()}`
}

function App() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState(['All Collections'])
  const [activeCategory, setActiveCategory] = useState('All Collections')
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)

  useEffect(() => {
    const loadCatalogue = async () => {
      try {
        const [productResponse, categoryResponse] = await Promise.all([
          fetch(`${API_URL}/products`),
          fetch(`${API_URL}/products/categories`),
        ])

        if (!productResponse.ok || !categoryResponse.ok) {
          throw new Error('The catalogue is temporarily unavailable.')
        }

        const productPayload = await productResponse.json()
        const categoryPayload = await categoryResponse.json()
        setProducts(productPayload.data || [])
        setCategories(categoryPayload.data || ['All Collections'])
      } catch (requestError) {
        setError(requestError.message)
      } finally {
        setIsLoading(false)
      }
    }

    loadCatalogue()
  }, [])

  const visibleProducts = useMemo(() => {
    const searchTerm = search.trim().toLowerCase()
    return products.filter((product) => {
      const matchesCategory = activeCategory === 'All Collections' || product.category === activeCategory
      const searchableText = `${product.name} ${product.shortDescription} ${product.category}`.toLowerCase()
      return matchesCategory && (!searchTerm || searchableText.includes(searchTerm))
    })
  }, [activeCategory, products, search])

  const featuredProduct = products.find((product) => product.isFeatured) || products[0]

  return (
    <div className="site-shell">
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="Dhaka Flower Tub home">
          <span className="wordmark-mark">d</span>
          <span>Dhaka Flower Tub</span>
        </a>
        <nav className={menuOpen ? 'main-nav is-open' : 'main-nav'} aria-label="Main navigation">
          <a href="#collection" onClick={() => setMenuOpen(false)}>Collection</a>
          <a href="#story" onClick={() => setMenuOpen(false)}>Our approach</a>
          <a href="#contact" onClick={() => setMenuOpen(false)}>Contact</a>
        </nav>
        <a className="header-cta" href={getWhatsAppLink()} target="_blank" rel="noreferrer">
          <MessageCircle size={16} /> Enquire on WhatsApp
        </a>
        <button className="menu-button" type="button" aria-label={menuOpen ? 'Close menu' : 'Open menu'} onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      <main id="top">
        <section className="hero-section">
          <div className="hero-copy">
            <p className="eyebrow">Cultivated forms for considered spaces</p>
            <h1>Bring a little <em>earth</em> home.</h1>
            <p className="hero-intro">Architectural flower tubs and planters, cast and finished by hand for homes, hospitality, and the spaces in between.</p>
            <a className="text-link" href="#collection">Explore the collection <MoveRight size={17} /></a>
          </div>
          <div className="hero-image-wrap">
            <img src={featuredProduct?.images?.[0]?.url} alt={featuredProduct?.images?.[0]?.alt || 'A sculptural flower tub with greenery'} />
            <div className="hero-note"><span>01</span><span>Designed in Dhaka<br />made to last</span></div>
          </div>
        </section>

        <section className="intro-strip" id="story">
          <p className="section-label">The Dhaka Flower Tub standard</p>
          <p className="intro-statement">Good planters do more than hold a plant. They give a room its rhythm, soften its edges, and make space for slower moments.</p>
          <a className="circle-link" href={getWhatsAppLink()} target="_blank" rel="noreferrer" aria-label="Talk to Dhaka Flower Tub on WhatsApp"><ArrowUpRight size={22} /></a>
        </section>

        <section className="collection-section" id="collection">
          <div className="section-heading">
            <div><p className="eyebrow">The current edit</p><h2>Find your form.</h2></div>
            <p>Small-batch pieces for indoor corners, open-air terraces, and everywhere you want a little more life.</p>
          </div>
          <div className="catalogue-controls">
            <div className="category-tabs" role="tablist" aria-label="Filter by collection">
              {categories.map((category) => <button className={activeCategory === category ? 'category-tab active' : 'category-tab'} type="button" role="tab" aria-selected={activeCategory === category} onClick={() => setActiveCategory(category)} key={category}>{category}</button>)}
            </div>
            <label className="search-field"><Search size={17} /><span className="sr-only">Search the collection</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search forms" /></label>
          </div>
          {isLoading && <p className="catalogue-message">Loading the collection...</p>}
          {error && <p className="catalogue-message error-message">{error} Make sure the API is running on port 5000.</p>}
          {!isLoading && !error && visibleProducts.length === 0 && <p className="catalogue-message">No pieces match that search yet.</p>}
          <div className="product-grid">
            {visibleProducts.map((product, index) => <article className="product-card" key={product._id || product.slug}>
              <div className="product-image">
                <img src={product.images?.[0]?.url} alt={product.images?.[0]?.alt || product.name} loading={index > 1 ? 'lazy' : 'eager'} />
                {product.badge && <span className="product-badge">{product.badge}</span>}
              </div>
              <div className="product-info"><div><p className="product-category">{product.category}</p><h3>{product.name}</h3></div><p className="product-price">{formatPrice(product)}</p></div>
              <p className="product-description">{product.shortDescription}</p>
              <div className="product-actions">
                <button className="view-details-button" type="button" onClick={() => setSelectedProduct(product)}>View details <ArrowUpRight size={15} /></button>
                <a className="product-contact-button" href={getWhatsAppLink(product)} target="_blank" rel="noreferrer"><MessageCircle size={15} /> Contact</a>
              </div>
            </article>)}
          </div>
        </section>

        <section className="contact-section" id="contact">
          <div><p className="eyebrow">Have a space in mind?</p><h2>Let’s find the right piece for it.</h2></div>
          <a className="contact-button" href={getWhatsAppLink()} target="_blank" rel="noreferrer"><MessageCircle size={19} /> Start a conversation <ArrowUpRight size={17} /></a>
        </section>
      </main>
      <footer className="site-footer"><span>© {new Date().getFullYear()} Dhaka Flower Tub</span><span>Made for spaces with room to grow.</span></footer>
      <ProductDetailsModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
    </div>
  )
}

export default App
