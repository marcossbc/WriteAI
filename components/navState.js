// Mobile drawer state lives on the DOM (the .dash element is rendered by a server component).
const dash = () => (typeof document === "undefined" ? null : document.querySelector(".dash"));
export function openNav() { dash()?.classList.add("nav-open"); document.documentElement.classList.add("nav-lock"); }
export function closeNav() { dash()?.classList.remove("nav-open"); document.documentElement.classList.remove("nav-lock"); }
export const isDesktop = () => window.matchMedia("(min-width: 901px)").matches;
