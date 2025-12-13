import { c as createComponent, r as renderComponent, a as renderTemplate } from '../chunks/astro/server_CP3F0ez_.mjs';
import 'piccolore';
import 'html-escaper';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState } from 'react';
import { N as Navbar } from '../chunks/navbar_6-lfAdBv.mjs';
/* empty css                                  */
export { renderers } from '../renderers.mjs';

const Signin = () => {
  const [email, setEmail] = useState("");
  const [pword, setPword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const handleSubimt = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const command = {
      commandId: crypto.randomUUID(),
      payload: { email, password: pword }
    };
    try {
      const result = await fetch("http://localhost:3000/pages/api/_find_user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(command),
        credentials: "include"
      });
      const data = await result.json();
      if (result.status === "accepted") {
        console.log("Logged in successfully: ", data);
        window.location.href = "/";
      } else if (result.status === "already processed") {
        setError("This command has already been processed");
      } else if (result.error) {
        setError(data.error);
      } else {
        setError("Log in failed. Please try again.");
      }
    } catch (err) {
      console.log("Failed to send login command: ", err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const handleRegister = () => {
    window.location.href = "/register";
  };
  return /* @__PURE__ */ jsxs("div", { className: "signin-container", children: [
    /* @__PURE__ */ jsx(Navbar, {}),
    /* @__PURE__ */ jsx("main", { children: /* @__PURE__ */ jsxs("form", { className: "signin-form", onSubmit: handleSubimt, children: [
      /* @__PURE__ */ jsx("h2", { children: "SyncUp" }),
      /* @__PURE__ */ jsx("label", { htmlFor: "email", children: "Email" }),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "email",
          id: "email",
          value: email,
          onChange: (e) => setEmail(e.target.value),
          required: true
        }
      ),
      /* @__PURE__ */ jsx("label", { htmlFor: "password", children: "Password" }),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "password",
          id: "password",
          value: pword,
          onChange: (e) => setPword(e.target.value),
          required: true
        }
      ),
      /* @__PURE__ */ jsx("button", { type: "submit", children: "Sign In" }),
      /* @__PURE__ */ jsx("div", { className: "register-link", children: /* @__PURE__ */ jsx("button", { type: "button", onClick: handleRegister, children: "Register" }) })
    ] }) })
  ] });
};

const $$Signin = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Navbar", Navbar, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/workspaces/calendar-project-group/src/components/navbar.jsx", "client:component-export": "default" })} ${renderComponent($$result, "SigninComponent", Signin, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/workspaces/calendar-project-group/src/components/signin.jsx", "client:component-export": "default" })}`;
}, "/workspaces/calendar-project-group/src/pages/signin.astro", void 0);

const $$file = "/workspaces/calendar-project-group/src/pages/signin.astro";
const $$url = "/signin";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: $$Signin,
    file: $$file,
    url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
