const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '8801711292501'

export const getWhatsAppLink = (product) => {
  const productMessage = product
    ? `Hello Dhaka Flower Tub, I am interested in this product.\n\nProduct: ${product.name}\nCategory: ${product.category}\n\nI would like to know more about this product.`
    : 'Hello Dhaka Flower Tub, I would like to enquire about your collection.'

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(productMessage)}`
}

export const getWhatsAppNumber = () => WHATSAPP_NUMBER
