// Please read the @/lib/types/toolconfig file for more details on each field.
import { ToolConfig } from "@/lib/types/toolconfig";

export const toolConfig: ToolConfig = {
  ////// Base config
  company: {
    name: "Chat",
    theme: "anotherwrapper",
    homeUrl: "/apps/chat",
    appUrl: "/apps/chat",
    description:
      "Build your own chatbot GPT wrapper using OpenAI's GPT-4o mini (or GPT-4o), LangChain and Supabase for memory.",
    logo: "https://cdn3.iconfinder.com/data/icons/aami-web-internet/64/aami4-68-512.png",
    navbarLinks: [
      { label: "App", href: `/apps/chat` },
      { label: "Home", href: "/" },
      { label: "Other apps", href: "/apps" },
      { label: "Blog", href: "/blog" },
    ],
  },

  ////// Metadata for SEO
  metadata: {
    title: "Build a chat bot using GPT-4o mini | AnotherWrapper",
    description:
      "Build your own chat bot GPT wrapper using OpenAI's GPT-4o mini (or GPT-4o), LangChain and Supabase for memory.",
    og_image: "https://anotherwrapper.com/og.png",
    canonical: "https://anotherwrapper.com/apps/chat",
  },

  ////// Payments
  paywall: true,
  credits: 5,

  ////// Location
  toolPath: "(apps)/chat",

  ////// AI config
  aiModel: "gpt-4o-mini",
  messagesToInclude: 10,
};
