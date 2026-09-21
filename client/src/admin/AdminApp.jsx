import { useEffect, useMemo, useState } from 'react'
import { LogOut, Package, Pencil, Plus, Search, Star, Trash2, X } from 'lucide-react'
import { adminRequest, API_URL, clearAdminToken, getAdminToken, saveAdminToken } from './adminApi'
import './admin.css'

const emptyForm = {
  name: '', slug: '', category: '', shortDescription: '', description: '', price: '', priceDisplay: '',
  material: '', finish: '', availability: 'in_stock', badge: '', isFeatured: false, sortOrder: 0,
  imageUrl: '', imageAlt: '', features: '', specifications: '', height: '', diameter: '', length: '', width: '',
}

const formFromProduct = (product) => ({
  name: product.name || '', slug: product.slug || '', category: product.category || '',
  shortDescription: product.shortDescription || '', description: product.description || '',
  price: product.price ?? '', priceDisplay: product.priceDisplay || '', material: product.material || '', finish: product.finish || '',
  availability: product.availability || 'in_stock', badge: product.badge || '', isFeatured: Boolean(product.isFeatured), sortOrder: product.sortOrder || 0,
  imageUrl: product.images?.[0]?.url || '', imageAlt: product.images?.[0]?.alt || '',
  features: (product.features || []).join('\n'), specifications: (product.specifications || []).map((item) => `${item.label} | ${item.value}`).join('\n'),
  height: product.dimensions?.height || '', diameter: product.dimensions?.diameter || '', length: product.dimensions?.length || '', width: product.dimensions?.width || '',
})

const formToProduct = (form) => ({
  name: form.name.trim(), slug: form.slug.trim(), category: form.category.trim(), shortDescription: form.shortDescription.trim(), description: form.description.trim(),
  price: Number(form.price) || 0, priceDisplay: form.priceDisplay.trim(), material: form.material.trim(), finish: form.finish.trim(), availability: form.availability,
  badge: form.badge.trim(), isFeatured: form.isFeatured, sortOrder: Number(form.sortOrder) || 0,
  images: form.imageUrl.trim() ? [{ url: form.imageUrl.trim(), alt: form.imageAlt.trim(), isPrimary: true }] : [],
  features: form.features.split('\n').map((item) => item.trim()).filter(Boolean),
  specifications: form.specifications.split('\n').map((item) => item.split('|').map((part) => part.trim())).filter(([label, value]) => label && value).map(([label, value]) => ({ label, value })),
  dimensions: { height: form.height.trim(), diameter: form.diameter.trim(), length: form.length.trim(), width: form.width.trim() },
})

function AdminLogin({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      const result = await fetch(`${API_URL}/auth/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }),
      })
      const payload = await result.json()
      if (!result.ok) throw new Error(payload.message || 'Unable to sign in.')
      saveAdminToken(payload.token)
      window.history.replaceState({}, '', '/admin')
      onLogin()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return <main className="admin-auth-shell"><div className="admin-auth-card"><div className="admin-brand"><span className="admin-brand-mark">d</span><span>Dhaka Flower Tub</span></div><p className="admin-kicker">Private workspace</p><h1>Welcome back.</h1><p className="admin-muted">Sign in to manage your product collection.</p><form onSubmit={submit} className="admin-form"><label>Username<input autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} required /></label><label>Password<input autoComplete="current-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>{error && <p className="admin-error">{error}</p>}<button className="admin-primary-button" disabled={isSubmitting}>{isSubmitting ? 'Signing in...' : 'Sign in'}</button></form><a className="back-to-site" href="/">Back to website</a></div></main>
}

function ProductForm({ product, onSaved, onCancel }) {
  const [form, setForm] = useState(product ? formFromProduct(product) : emptyForm)
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }))
  const submit = async (event) => {
    event.preventDefault()
    if (!form.name.trim() || !form.category.trim()) { setError('Name and category are required.'); return }
    setError('')
    setIsSaving(true)
    try {
      const path = product ? `/products/${product._id}` : '/products'
      const result = await adminRequest(path, { method: product ? 'PUT' : 'POST', body: JSON.stringify(formToProduct(form)) })
      onSaved(result.data)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsSaving(false)
    }
  }

  return <div className="admin-form-panel"><div className="admin-panel-heading"><div><p className="admin-kicker">{product ? 'Update catalogue item' : 'New catalogue item'}</p><h2>{product ? 'Edit product' : 'Add product'}</h2></div><button className="icon-button" type="button" onClick={onCancel} aria-label="Close product form"><X size={19} /></button></div><form className="admin-product-form" onSubmit={submit}><fieldset><legend>Basic information</legend><div className="admin-field-grid"><label className="wide-field">Name *<input value={form.name} onChange={(event) => updateField('name', event.target.value)} required /></label><label>Category *<input value={form.category} onChange={(event) => updateField('category', event.target.value)} required /></label><label>Slug<input value={form.slug} onChange={(event) => updateField('slug', event.target.value)} placeholder="Generated from name if blank" /></label><label className="wide-field">Short description<textarea rows="2" value={form.shortDescription} onChange={(event) => updateField('shortDescription', event.target.value)} /></label><label className="wide-field">Description<textarea rows="4" value={form.description} onChange={(event) => updateField('description', event.target.value)} /></label></div></fieldset><fieldset><legend>Pricing and availability</legend><div className="admin-field-grid"><label>Price<input type="number" min="0" value={form.price} onChange={(event) => updateField('price', event.target.value)} /></label><label>Display price<input value={form.priceDisplay} onChange={(event) => updateField('priceDisplay', event.target.value)} placeholder="৳ 1,650" /></label><label>Status<select value={form.availability} onChange={(event) => updateField('availability', event.target.value)}><option value="in_stock">In stock</option><option value="made_to_order">Made to order</option><option value="out_of_stock">Out of stock</option></select></label><label>Badge<input value={form.badge} onChange={(event) => updateField('badge', event.target.value)} placeholder="Bestseller" /></label><label>Sort order<input type="number" value={form.sortOrder} onChange={(event) => updateField('sortOrder', event.target.value)} /></label><label className="checkbox-field"><input type="checkbox" checked={form.isFeatured} onChange={(event) => updateField('isFeatured', event.target.checked)} /> Featured product</label></div></fieldset><fieldset><legend>Image</legend><div className="admin-field-grid"><label className="wide-field">Image URL<input type="url" value={form.imageUrl} onChange={(event) => updateField('imageUrl', event.target.value)} placeholder="https://..." /></label><label className="wide-field">Image alt text<input value={form.imageAlt} onChange={(event) => updateField('imageAlt', event.target.value)} /></label></div><p className="admin-help">Image uploads are not implemented yet. Use a hosted image URL for now.</p></fieldset><fieldset><legend>Details</legend><div className="admin-field-grid"><label>Material<input value={form.material} onChange={(event) => updateField('material', event.target.value)} /></label><label>Finish<input value={form.finish} onChange={(event) => updateField('finish', event.target.value)} /></label><label>Height<input value={form.height} onChange={(event) => updateField('height', event.target.value)} /></label><label>Diameter<input value={form.diameter} onChange={(event) => updateField('diameter', event.target.value)} /></label><label>Length<input value={form.length} onChange={(event) => updateField('length', event.target.value)} /></label><label>Width<input value={form.width} onChange={(event) => updateField('width', event.target.value)} /></label><label className="wide-field">Features <span className="admin-help">One per line</span><textarea rows="4" value={form.features} onChange={(event) => updateField('features', event.target.value)} /></label><label className="wide-field">Specifications <span className="admin-help">One per line, formatted as Label | Value</span><textarea rows="5" value={form.specifications} onChange={(event) => updateField('specifications', event.target.value)} /></label></div></fieldset>{error && <p className="admin-error">{error}</p>}<div className="form-actions"><button className="admin-secondary-button" type="button" onClick={onCancel}>Cancel</button><button className="admin-primary-button" disabled={isSaving}>{isSaving ? 'Saving...' : product ? 'Save changes' : 'Create product'}</button></div></form></div>
}

function AdminDashboard({ onLogout }) {
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState('')
  const [editingProduct, setEditingProduct] = useState(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const loadProducts = async () => {
    try { const result = await adminRequest('/products?limit=100'); setProducts(result.data || []) } catch (requestError) { if (requestError.status === 401) onLogout(); else setError(requestError.message) } finally { setIsLoading(false) }
  }
  useEffect(() => { loadProducts() }, [])

  const visibleProducts = useMemo(() => products.filter((product) => `${product.name} ${product.category}`.toLowerCase().includes(search.toLowerCase().trim())), [products, search])
  const saveProduct = (savedProduct) => { setProducts((current) => { const exists = current.some((item) => item._id === savedProduct._id); return exists ? current.map((item) => item._id === savedProduct._id ? savedProduct : item) : [savedProduct, ...current] }); setEditingProduct(null); setIsFormOpen(false) }
  const deleteProduct = async (product) => { if (!window.confirm(`Delete ${product.name}?`)) return; try { await adminRequest(`/products/${product._id}`, { method: 'DELETE' }); setProducts((current) => current.filter((item) => item._id !== product._id)) } catch (requestError) { setError(requestError.message) } }
  const updateProduct = async (product, changes) => { try { const result = await adminRequest(`/products/${product._id}`, { method: 'PUT', body: JSON.stringify(changes) }); setProducts((current) => current.map((item) => item._id === product._id ? result.data : item)) } catch (requestError) { setError(requestError.message) } }
  const logout = () => { clearAdminToken(); window.history.replaceState({}, '', '/admin/login'); onLogout() }

  return <main className="admin-shell"><header className="admin-header"><a className="admin-brand" href="/"><span className="admin-brand-mark">d</span><span>Dhaka Flower Tub <small>Admin</small></span></a><div className="admin-header-actions"><a href="/" className="back-to-site">View website</a><button className="admin-logout" type="button" onClick={logout}><LogOut size={16} /> Log out</button></div></header><section className="admin-content"><div className="admin-page-heading"><div><p className="admin-kicker">Catalogue workspace</p><h1>Products</h1><p className="admin-muted">Manage the pieces shown on your public collection.</p></div><button className="admin-primary-button add-button" type="button" onClick={() => { setEditingProduct(null); setIsFormOpen(true) }}><Plus size={17} /> Add product</button></div>{error && <p className="admin-error admin-banner">{error}</p>}<div className="admin-toolbar"><div className="admin-stat"><Package size={18} /><strong>{products.length}</strong><span>products</span></div><label className="admin-search"><Search size={17} /><span className="sr-only">Search products</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products" /></label></div>{isLoading ? <p className="admin-muted">Loading products...</p> : <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Status</th><th>Featured</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{visibleProducts.map((product) => <tr key={product._id || product.slug}><td><div className="admin-product-cell">{product.images?.[0]?.url ? <img src={product.images[0].url} alt="" /> : <div className="admin-image-placeholder"><Package size={15} /></div>}<strong>{product.name}</strong></div></td><td>{product.category}</td><td>{product.priceDisplay || product.price || 'On request'}</td><td><select className="status-select" value={product.availability} onChange={(event) => updateProduct(product, { availability: event.target.value })}><option value="in_stock">In stock</option><option value="made_to_order">Made to order</option><option value="out_of_stock">Out of stock</option></select></td><td><button className={product.isFeatured ? 'feature-toggle active' : 'feature-toggle'} type="button" aria-label={product.isFeatured ? 'Remove featured status' : 'Mark as featured'} onClick={() => updateProduct(product, { isFeatured: !product.isFeatured })}><Star size={16} fill={product.isFeatured ? 'currentColor' : 'none'} /></button></td><td><div className="row-actions"><button className="icon-button" type="button" onClick={() => { setEditingProduct(product); setIsFormOpen(true) }} aria-label={`Edit ${product.name}`}><Pencil size={16} /></button><button className="icon-button danger" type="button" onClick={() => deleteProduct(product)} aria-label={`Delete ${product.name}`}><Trash2 size={16} /></button></div></td></tr>)}</tbody></table>{visibleProducts.length === 0 && <p className="admin-empty">No products match your search.</p>}</div>}</section>{isFormOpen && <div className="admin-form-overlay"><ProductForm product={editingProduct} onSaved={saveProduct} onCancel={() => setIsFormOpen(false)} /></div>}</main>
}

function AdminApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(getAdminToken()))
  const [isChecking, setIsChecking] = useState(Boolean(getAdminToken()))

  useEffect(() => {
    if (!getAdminToken()) return undefined
    adminRequest('/auth/me').catch(() => { clearAdminToken(); setIsAuthenticated(false) }).finally(() => setIsChecking(false))
    return undefined
  }, [])

  if (isChecking) return <main className="admin-auth-shell"><p className="admin-muted">Checking access...</p></main>
  if (!isAuthenticated) return <AdminLogin onLogin={() => setIsAuthenticated(true)} />
  return <AdminDashboard onLogout={() => setIsAuthenticated(false)} />
}

export default AdminApp
