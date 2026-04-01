/**
 * LazadaSyncService — đẩy sản phẩm/biến thể sang Lazada qua integration API
 * POST http://localhost:9920/integration/lazada/product/create
 */

const prefixBiz = "/bizapi";
const LAZADA_API = prefixBiz + "/integration/lazada/product/create";
const CHANNEL_ID = 1;
const REGION     = "VN";

export interface IProductVariant {
  id?: number;
  sku?: string;
  price?: number;
  priceWholesale?: number;
  stock?: number;
  weight?: number;
  avatar?: string;
  name?: string;
  variantName?: string;
  packageLength?: number;
  packageWidth?: number;
  packageHeight?: number;
}

export interface IProductForSync {
  id: number;
  name: string;
  description?: string;
  price?: number;
  avatar?: string;
  code?: string;
  productLine?: string;
  categoryId?: number;
  categoryName?: string;
  variants?: IProductVariant[];
  stock?: number;
}

/**
 * Build XML payload cho Lazada API
 * Mỗi biến thể → 1 Sku trong XML
 */
function buildLazadaXml(product: IProductForSync): string {
  const categoryId = product.categoryId ?? 6652;
  const brand      = "Reborn";
  const shortDesc  = product.description
    ? product.description.replace(/<[^>]*>/g, "").slice(0, 255)
    : product.name;

  // Nếu có biến thể → 1 Sku per variant; không thì 1 Sku chính
  const skus = (product.variants && product.variants.length > 0)
    ? product.variants
    : [{
        sku:           product.productLine ?? product.code ?? `PRD-${product.id}`,
        price:         product.price ?? 0,
        stock:         product.stock ?? 0,
        weight:        1,
        avatar:        product.avatar,
        packageLength: 20,
        packageWidth:  20,
        packageHeight: 10,
      }];

  const skuXml = skus.map((v, idx) => {
    const sellerSku = v.sku ?? v.variantName ?? `${product.id}-${idx}`;
    const price     = v.price ?? product.price ?? 0;
    const qty       = v.stock ?? 0;
    const weight    = v.weight ?? 1;
    const length    = v.packageLength ?? 20;
    const width     = v.packageWidth  ?? 20;
    const height    = v.packageHeight ?? 10;
    const imgUrl    = v.avatar ?? product.avatar ?? "";

    return `<Sku>
        <SellerSku>${escXml(sellerSku)}</SellerSku>
        <quantity>${qty}</quantity>
        <price>${price}</price>
        <package_weight>${weight}</package_weight>
        <package_length>${length}</package_length>
        <package_width>${width}</package_width>
        <package_height>${height}</package_height>
        ${imgUrl ? `<Images><Image>${escXml(imgUrl)}</Image></Images>` : ""}
      </Sku>`;
  }).join("\n      ");

  return `<Request><Product>
  <PrimaryCategory>${categoryId}</PrimaryCategory>
  <Attributes>
    <name>${escXml(product.name)}</name>
    <short_description>${escXml(shortDesc)}</short_description>
    <brand>${brand}</brand>
  </Attributes>
  <Skus>
    ${skuXml}
  </Skus>
</Product></Request>`;
}

function escXml(s: string | number): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Gọi API đẩy sản phẩm sang Lazada
 */
export async function syncProductToLazada(
  product: IProductForSync,
  token = ""
): Promise<{ success: boolean; message: string; data?: any }> {
  const payloadXml = buildLazadaXml(product);
  const body = {
    channelId:         CHANNEL_ID,
    region:            REGION,
    internalProductId: product.productLine ?? product.code ?? `PRD-${product.id}`,
    payloadXml,
  };

  try {
    const res = await fetch(LAZADA_API, {
      method:  "POST",
      headers: {
        "Content-Type":  "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => ({}));

    if (res.ok) {
      return { success: true,  message: "Đồng bộ Lazada thành công!", data };
    } else {
      const msg = data?.message ?? data?.error ?? `Lỗi HTTP ${res.status}`;
      return { success: false, message: msg, data };
    }
  } catch (err: any) {
    return { success: false, message: err?.message ?? "Không thể kết nối integration server" };
  }
}