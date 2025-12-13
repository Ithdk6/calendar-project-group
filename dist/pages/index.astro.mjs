import { c as createComponent, r as renderComponent, a as renderTemplate } from '../chunks/astro/server_CP3F0ez_.mjs';
import 'piccolore';
import 'html-escaper';
import { H as Homepage } from '../chunks/homepage_DTVJnqNJ.mjs';
import { N as Navbar } from '../chunks/navbar_6-lfAdBv.mjs';
export { renderers } from '../renderers.mjs';

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "NavBar", Navbar, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/workspaces/calendar-project-group/src/components/navbar.jsx", "client:component-export": "default" })} ${renderComponent($$result, "Homepage", Homepage, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/workspaces/calendar-project-group/src/components/homepage.jsx", "client:component-export": "default" })}`;
}, "/workspaces/calendar-project-group/src/pages/index.astro", void 0);

const $$file = "/workspaces/calendar-project-group/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$Index,
	file: $$file,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
