function sentryInit() {
  Sentry.init({
    dsn: "https://1b221fb4ea9d49a9ae66eb75ce440594@o4504712359182336.ingest.sentry.io/4504712360427520",
    integrations: [new BrowserTracing()],

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,
  });
}

export { sentryInit }


