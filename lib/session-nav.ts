// Client-side navigations (next/link, router.push) never update
// document.referrer, so it can't tell us whether the user arrived at the
// current page via an in-app link vs. a direct load/refresh/external link.
// This tracks that instead: any pathname change after the first render
// within this tab's JS session means there is real history to go back to.
let navigatedWithinSession = false;

export function markNavigatedWithinSession() {
  navigatedWithinSession = true;
}

export function hasNavigatedWithinSession() {
  return navigatedWithinSession;
}
