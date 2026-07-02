/* Shopier Virtual POS integration
 * Docs: https://dev.shopier.com
 * API endpoint: POST https://www.shopier.com/ShowProduct/api_pay4.php
 */

export type ShopierConfig = {
  api_key: string
  api_secret: string
  merchant_id?: string
}

export type ShopierPaymentParams = {
  buyerName: string
  buyerSurname: string
  buyerEmail: string
  buyerPhone: string
  buyerAddress: string
  buyerCity: string
  buyerIdentityNumber?: string
  totalAmount: number
  currency: number // 0=TRY, 1=USD, 2=EUR
  platformOrderId: string
  productName: string
  callbackUrl: string
}

async function hmacSha256Base64(message: string, secret: string): Promise<string> {
  const encoder = new TextEncoder()
  const keyData = encoder.encode(secret)
  const messageData = encoder.encode(message)

  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const signature = await crypto.subtle.sign('HMAC', key, messageData)
  return btoa(String.fromCharCode(...new Uint8Array(signature)))
}

export async function redirectToShopier(
  config: ShopierConfig,
  params: ShopierPaymentParams
): Promise<void> {
  const randomNr = Math.random().toString(36).substring(2, 18)
  const identityNumber = params.buyerIdentityNumber || ''
  const installmentCount = '1'
  const isInFrame = '0'
  const currentLanguage = '0' // TR
  const productType = '1' // physical
  const currency = String(params.currency ?? 0)
  const totalStr = params.totalAmount.toFixed(2)

  // Signature string order per Shopier docs
  const signatureStr = [
    randomNr,
    params.buyerName,
    params.buyerSurname,
    params.buyerEmail,
    params.buyerPhone,
    identityNumber,
    params.buyerAddress,
    params.buyerCity,
    'TR',
    totalStr,
    currency,
    installmentCount,
    params.platformOrderId,
    isInFrame,
    currentLanguage,
    params.productName,
    productType,
  ].join('')

  const signature = await hmacSha256Base64(signatureStr, config.api_secret)

  const formData: Record<string, string> = {
    API_key: config.api_key,
    random_nr: randomNr,
    signature,
    product_name: params.productName,
    product_type: productType,
    buyer_name: params.buyerName,
    buyer_surname: params.buyerSurname,
    buyer_email: params.buyerEmail,
    buyer_phone: params.buyerPhone,
    buyer_address: params.buyerAddress,
    buyer_city: params.buyerCity,
    buyer_country: 'TR',
    buyer_identity_number: identityNumber,
    total_order_value: totalStr,
    currency,
    installment_count: installmentCount,
    platform_order_id: params.platformOrderId,
    is_in_frame: isInFrame,
    current_language: currentLanguage,
    callback_url: params.callbackUrl,
  }

  // Create and submit a hidden form
  const form = document.createElement('form')
  form.method = 'POST'
  form.action = 'https://www.shopier.com/ShowProduct/api_pay4.php'
  form.style.display = 'none'

  Object.entries(formData).forEach(([key, value]) => {
    const input = document.createElement('input')
    input.type = 'hidden'
    input.name = key
    input.value = value
    form.appendChild(input)
  })

  document.body.appendChild(form)
  form.submit()
}

let cachedConfig: ShopierConfig | null = null

export async function loadShopierConfig(): Promise<ShopierConfig | null> {
  if (cachedConfig) return cachedConfig
  try {
    const base = import.meta.env.BASE_URL || '/'
    const res = await fetch(`${base}config/shopier.json`)
    const data = await res.json()
    if (data.api_key && data.api_key !== 'YOUR_API_KEY_HERE') {
      cachedConfig = data
      return data
    }
    return null
  } catch {
    return null
  }
}
