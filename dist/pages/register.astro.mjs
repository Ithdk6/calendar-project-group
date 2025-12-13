import { c as createComponent, r as renderComponent, a as renderTemplate } from '../chunks/astro/server_CP3F0ez_.mjs';
import 'piccolore';
import 'html-escaper';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState } from 'react';
import { N as Navbar } from '../chunks/navbar_6-lfAdBv.mjs';
/* empty css                                    */
export { renderers } from '../renderers.mjs';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: ""
  });
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const [isloading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.password_confirmation) {
      setError("Passwords don't match");
      return;
    }
    setIsLoading(true);
    setError("");
    const command = {
      commandId: crypto.randomUUID(),
      payload: {
        name: formData.name,
        email: formData.email,
        password: formData.password
      }
    };
    try {
      const result = await fetch("http://localhost:3000/pages/api/_add_user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(command),
        credentials: "include"
      });
      const data = await result.json();
      if (result.status === "Username taken") {
        setError("Email already in use");
      } else {
        console.log("API response: ", data);
        window.location.href = "/login";
      }
    } catch (err) {
      console.log("Failed to send registration command: ", err);
      setError("Registration failed");
    } finally {
      setIsLoading(false);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "register-container", children: [
    /* @__PURE__ */ jsx(Navbar, {}),
    /* @__PURE__ */ jsx("main", { children: /* @__PURE__ */ jsxs("form", { className: "register-form", onSubmit: handleSubmit, children: [
      /* @__PURE__ */ jsx("h2", { children: "Create your SyncUp Account" }),
      /* @__PURE__ */ jsx("label", { htmlFor: "name", children: "Name" }),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "text",
          id: "name",
          name: "name",
          value: formData.name,
          onChange: handleChange,
          required: true
        }
      ),
      /* @__PURE__ */ jsx("label", { htmlFor: "email", children: "Email" }),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "email",
          id: "email",
          name: "email",
          value: formData.email,
          onChange: handleChange,
          required: true
        }
      ),
      /* @__PURE__ */ jsx("label", { htmlFor: "password", children: "Password" }),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "password",
          id: "password",
          name: "password",
          value: formData.password,
          onChange: handleChange,
          required: true
        }
      ),
      /* @__PURE__ */ jsx("label", { htmlFor: "password_confirmation", children: "Confirm Password" }),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "password",
          id: "password_confirmation",
          name: "password_confirmation",
          value: formData.password_confirmation,
          onChange: handleChange,
          required: true
        }
      ),
      /* @__PURE__ */ jsx("button", { type: "submit", children: "Register" })
    ] }) })
  ] });
};

const $$Register = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Navbar", Navbar, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/workspaces/calendar-project-group/src/components/navbar.jsx", "client:component-export": "default" })} ${renderComponent($$result, "RegisterComponent", RegisterPage, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/workspaces/calendar-project-group/src/components/register.jsx", "client:component-export": "default" })}`;
}, "/workspaces/calendar-project-group/src/pages/register.astro", void 0);

const $$file = "/workspaces/calendar-project-group/src/pages/register.astro";
const $$url = "/register";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: $$Register,
    file: $$file,
    url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
