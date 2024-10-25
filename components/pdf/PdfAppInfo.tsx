import AppInfo from "@/components/input/AppInfo";
import { AnimatedBeamMultipleInputDemo } from "@/components/magicui/animated-beam-multiple";
import { IconOpenAI } from "@/components/icons";
import {
  GearIcon,
  Link1Icon,
  PaddingIcon,
  RocketIcon,
} from "@radix-ui/react-icons";
import { BookIcon, DatabaseIcon, RouteIcon, TrashIcon } from "lucide-react";
import { IconVector } from "@tabler/icons-react";
import Info from "@/components/alerts/Info";

export default function PdfAppInfo() {
  return (
    <AppInfo title="Chat with a PDF file" background="bg-primary/5">
      <div className="py-8 flex justify-center">
        <AnimatedBeamMultipleInputDemo />
      </div>
      <Info>
        Have a look{" "}
        <a
          href="https://docs.anotherwrapper.com/ai/pdf"
          target="_blank"
          className="font-semibold underline"
        >
          at the documentation
        </a>{" "}
        for more information on setting up the app.
      </Info>

      <ul className="mt-4 ml-4 text-sm space-y-2 flex flex-col mb-4 relative xs:leading-7">
        <li className="text-l flex">
          <span className="w-4 h-4 mt-1">
            <IconOpenAI className="w-4 h-4" />
          </span>
          <span className="ml-2">
            This demo application uses OpenAI, LangChain.js, Supabase and
            Cloudflare R2 to allow you to chat with a PDF.
          </span>
        </li>
        <li className="text-l flex">
          <span className="w-4 h-4 mt-1">
            <DatabaseIcon className="w-4 h-4" />
          </span>
          <span className="ml-2">
            PDF is uploaded into Cloudflare R2, then split into chunks and
            embedded in Supabase vector storage.
          </span>
        </li>
        <li className="text-l flex">
          <span className="w-4 h-4 mt-1">
            <PaddingIcon className="w-4 h-4" />
          </span>
          <span className="ml-2">
            The main frontend logic is found in the{" "}
            <code>app/(apps)/chat/pdf</code> folder.
          </span>
        </li>
        <li className="text-l flex">
          <span className="w-4 h-4 mt-1">
            <GearIcon className="w-4 h-4" />
          </span>
          <span className="ml-2">
            The main configuration file can be found in{" "}
            <code>app/(apps)/pdf/toolConfig.ts</code> file. You can specify the
            GPT model used & number messages included in the history.
          </span>
        </li>
        <li className="text-l flex">
          <span className="w-4 h-4 mt-1">
            <RouteIcon className="w-4 h-4" />
          </span>
          <span className="ml-2">
            The API endpoint and logic can be found in{" "}
            <code>app/api/(apps)/pdf/chat/route.ts</code>.
          </span>
        </li>
        <li className="text-l flex">
          <span className="w-4 h-4 mt-1">
            <IconVector className="w-4 h-4" />
          </span>
          <span className="ml-2">
            The API to generate embeddings be found in{" "}
            <code>app/api/(apps)/pdf/vectorize/route.ts</code>.
          </span>
        </li>
        <li className="text-l flex">
          <span className="w-4 h-4 mt-1">
            <Link1Icon className="w-4 h-4" />
          </span>
          <span className="ml-2">
            The API to upload PDF can be found in{" "}
            <code>app/api/(apps)/pdf/upload/route.ts</code>.
          </span>
        </li>
        <li className="text-l flex">
          <span className="w-4 h-4 mt-1">
            <TrashIcon className="w-4 h-4" />
          </span>
          <span className="ml-2">
            The API to delete PDF & embeddings can be found in{" "}
            <code>app/api/(apps)/pdf/delete/route.ts</code>.
          </span>
        </li>
        <li className="text-l flex">
          <span className="w-4 h-4 mt-1">
            <RocketIcon className="w-4 h-4" />
          </span>
          <span className="ml-2">Hope you like it - give it a try!</span>
        </li>
      </ul>
    </AppInfo>
  );
}
