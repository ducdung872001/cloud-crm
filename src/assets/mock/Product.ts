export const ProductLabel = {
  new: {
    label: "Mới",
    color: "success"
  },
  hot: {
    label: "Bán chạy",
    color: "error"
  },
  sale: {
    label: "Khuyến mãi",
    color: "warning"
  }
}

export const PRODUCT_DETAIL_CONFIG = [
  { key: "showImage", label: "Hiển thị hình ảnh sản phẩm" },
  { key: "showUnit", label: "Hiển thị đơn vị sản phẩm" },
  { key: "showDesc", label: "Hiển thị mô tả sản phẩm" },
  { key: "showPrice", label: "Hiển thị giá sản phẩm" },
  {key: "showCost", label: "Hiển thị giá sỉ"},
  {key: "showInventory", label: "Hiển thị số lượng tồn kho"},
  { key: "showSalePrice", label: "Hiển thị giá khuyến mãi" },
  { key: "showBarcode", label: "Hiển thị mã vạch" },
  { key: "showCategory", label: "Hiển thị phân loại" },
  { key: "showLabel", label: "Hiển thị nhãn sản phẩm" },
  { key: "showProduct", label: "Hiển thị sản phẩm"}
];

export const MOCK_PRODUCT_CATEGORIES = [
  { id: 1, name: "Thực phẩm", position: 1, status: 1, productCount: 12 },
  { id: 2, name: "Đồ uống", position: 2, status: 1, productCount: 8 },
  { id: 3, name: "Dược phẩm", position: 3, status: 1, productCount: 5 },
  { id: 4, name: "Mỹ phẩm", position: 4, status: 0, productCount: 3 },
  { id: 5, name: "Đồ gia dụng", position: 5, status: 1, productCount: 20 },
  { id: 6, name: "Điện tử", position: 6, status: 1, productCount: 15 },
  { id: 7, name: "Thời trang", position: 7, status: 0, productCount: 7 },
  { id: 8, name: "Văn phòng phẩm", position: 8, status: 1, productCount: 9 },
  { id: 9, name: "Thể thao", position: 9, status: 1, productCount: 6 },
  { id: 10, name: "Đồ chơi", position: 10, status: 0, productCount: 4 },
];