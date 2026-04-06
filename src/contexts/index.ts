// Split contexts — use these for new code (better performance)
export { AuthContext, useAuth } from "./authContext";
export type { AuthContextType } from "./authContext";

export { UIContext, useUI } from "./uiContext";
export type { UIContextType } from "./uiContext";

export { CallContext, useCall } from "./callContext";
export type { CallContextType } from "./callContext";

// Legacy — still works, but causes unnecessary re-renders
// Gradually migrate consumers to useAuth/useUI/useCall
export { UserContext } from "./userContext";
export type { ContextType } from "./userContext";
