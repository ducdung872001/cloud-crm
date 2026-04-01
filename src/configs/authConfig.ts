import { LogLevel } from "@azure/msal-browser";

export const msalConfig = {
  auth: {
    clientId: "9d56aa14-bc78-4f52-841d-fd5329639631",
    authority: "https://login.microsoftonline.com/common",
    redirectUri: (typeof process !== "undefined" && process.env?.OUTLOOK_EMAIL_REDIRECT) || "/",
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level: number, message: string, containsPii: boolean) => {
        if (containsPii) return;
        switch (level) {
          case LogLevel.Error: console.error(message); return;
          case LogLevel.Info: console.info(message); return;
          case LogLevel.Verbose: console.debug(message); return;
          case LogLevel.Warning: console.warn(message); return;
          default: return;
        }
      },
    },
  },
};

export const loginRequest = {
  scopes: ["User.Read", "Mail.Read", "Mail.Send"],
};

export const graphConfig = {
  graphMeEndpoint: "https://graph.microsoft.com/v1.0/me",
};