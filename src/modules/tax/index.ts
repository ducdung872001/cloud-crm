// Barrel — single entry point cho tax module.
// Khi port sang nhánh khác: import từ "@/modules/tax" thôi.

// Domain (pure TS) — có thể dùng ở BE hoặc test
export * from "./domain/types";
export * from "./domain/constants";
export { taxEngine, TaxCalculator, ThresholdChecker, DeclarationBuilder, DeadlineHelper } from "./domain/engine";

// Adapters
export type { DataSourceAdapter } from "./adapters/types";
export {
  registerDataSourceAdapter,
  getDataSourceAdapter,
  getDefaultAdapter,
  setDefaultAdapter,
  listDataSourceAdapters,
} from "./adapters/types";
export { mockAdapter } from "./adapters/mockAdapter";
export { fitproAdapter, setFitProBookingsProvider } from "./adapters/fitproAdapter";
export { communityHubAdapter, setCommunityHubProvider } from "./adapters/communityHubAdapter";
export {
  retailAdapter,
  setRetailOrderProvider,
  setRetailExpenseProvider,
  setRetailInventoryProvider,
} from "./adapters/retailAdapter";

// Services
export { taxStorage } from "./services/taxStorage";
export { eTaxGateway } from "./services/eTaxGateway";

// Routes — cho host app đăng ký
export { TAX_ROUTES, TAX_MENU_ITEM } from "./routes";
export type { TaxRouteDef } from "./routes";

// UI default export — để host app có thể mount trực tiếp nếu muốn
export { default as TaxModule } from "./ui/TaxModule";
