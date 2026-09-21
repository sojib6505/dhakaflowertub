import { useEffect } from 'react'
import { ArrowUpRight, Check, MessageCircle, X } from 'lucide-react'
import { getWhatsAppLink } from '../utils/whatsapp'

const availabilityLabels = {
  in_stock: 'In stock',
  made_to_order: 'Made to order',
  out_of_stock: 'Currently unavailable',
}

const formatPrice = (product) => {
  if (product.priceDisplay) return product.priceDisplay
  if (product.isPriceCustom || !product.price) return 'Price on request'
  return `৳ ${product.price.toLocaleString()}`
}

function ProductDetailsModal({ product, onClose }) {
  useEffect(() => {
    if (!product) return undefined

    const closeOnEscape = (event) => {
      if (event.key === 'Escape') onClose()
    }

    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', closeOnEscape)

    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [onClose, product])

  if (!product) return null

  const specifications = product.specifications || []
  const features = product.features || []
  const dimensions = Object.entries(product.dimensions || {}).filter(([, value]) => value)

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="product-modal" role="dialog" aria-modal="true" aria-labelledby="product-modal-title">
        <button className="modal-close" type="button" onClick={onClose} aria-label="Close product details"><X size={20} /></button>
        <div className="modal-image-wrap">
          <img src={product.images?.[0]?.url} alt={product.images?.[0]?.alt || product.name} />
          {product.badge && <span className="product-badge">{product.badge}</span>}
        </div>
        <div className="modal-content">
          <p className="product-category">{product.category}</p>
          <h2 id="product-modal-title">{product.name}</h2>
          <div className="modal-price-row"><p className="modal-price">{formatPrice(product)}</p><span className={`availability availability-${product.availability}`}>{availabilityLabels[product.availability] || product.availability}</span></div>
          <p className="modal-description">{product.description || product.shortDescription}</p>
          <div className="modal-details-grid">
            <div><p className="detail-label">Material</p><p>{product.material || 'Premium concrete / fiber'}</p></div>
            <div><p className="detail-label">Finish</p><p>{product.finish || 'Matte smooth'}</p></div>
          </div>
          {dimensions.length > 0 && <div className="modal-block"><p className="detail-label">Dimensions</p><div className="dimensions-list">{dimensions.map(([label, value]) => <span key={label}><strong>{label}</strong>{value}</span>)}</div></div>}
          {specifications.length > 0 && <div className="modal-block"><p className="detail-label">Specifications</p><div className="spec-list">{specifications.map((specification) => <div key={`${specification.label}-${specification.value}`}><span>{specification.label}</span><strong>{specification.value}</strong></div>)}</div></div>}
          {features.length > 0 && <div className="modal-block"><p className="detail-label">Made for living</p><ul className="feature-list">{features.map((feature) => <li key={feature}><Check size={15} />{feature}</li>)}</ul></div>}
          <a className="modal-contact" href={getWhatsAppLink(product)} target="_blank" rel="noreferrer"><MessageCircle size={18} /> Contact about this piece <ArrowUpRight size={17} /></a>
        </div>
      </section>
    </div>
  )
}

export default ProductDetailsModal
