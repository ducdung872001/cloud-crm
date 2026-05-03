// import React from "react";
// import ReactDOM from "react-dom";
// import { BrowserRouter } from "react-router-dom";
// import "whatwg-fetch";
// import { CookiesProvider } from "react-cookie";
// import { I18nextProvider } from "react-i18next";
// import i18n from "./i18n";
// import App from "./App";

// ReactDOM.render(
//   <CookiesProvider>
//     <I18nextProvider i18n={i18n}>
//       <BrowserRouter basename="/crm/">
//         <App />
//       </BrowserRouter>
//     </I18nextProvider>
//   </CookiesProvider>,
//   document.querySelector("#root")
// );
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "whatwg-fetch";
import { CookiesProvider } from "react-cookie";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";
import App from "./App";
import { runBootMigration } from "./bootMigration";

// Reset 1 lần/browser cho user kẹt 401 loop (cookie/SW cũ từ phiên trước).
runBootMigration();

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <CookiesProvider>
    <I18nextProvider i18n={i18n}>
      <BrowserRouter basename="/crm/">
        <App />
      </BrowserRouter>
    </I18nextProvider>
  </CookiesProvider>
);
