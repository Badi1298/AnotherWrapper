import AppInfo from "@/components/input/AppInfo";
import { AnimatedBeamOpenAI } from "@/components/magicui/animated-beam-bi-directional";
import { IconOpenAI } from "@/components/icons";
import {
  GearIcon,
  Link1Icon,
  PaddingIcon,
  RocketIcon,
} from "@radix-ui/react-icons";
import { BookIcon, MicIcon, SpeakerIcon, VolumeIcon } from "lucide-react";
import Info from "@/components/alerts/Info";

export default function VoiceAppInfo() {
  return (
    <AppInfo title="Text to speech demo app" background="bg-primary/5">
      <div className="py-8 flex justify-center">
        <AnimatedBeamOpenAI />
      </div>
      <Info>
        Have a look{" "}
        <a
          href="https://docs.anotherwrapper.com/ai/voice"
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
            This demo application uses the ElevenLabs API to generate
            high-quality text-to-speech conversions.
          </span>
        </li>
        <li className="text-l flex">
          <span className="w-4 h-4 mt-1">
            <VolumeIcon className="w-4 h-4" />
          </span>
          <span className="ml-2">
            Choose from 1.000+ voices (45 by default, more in their Voice
            Library) and 26 languages to personalize your audio output.
          </span>
        </li>
        <li className="text-l flex">
          <span className="w-4 h-4 mt-1">
            <PaddingIcon className="w-4 h-4" />
          </span>
          <span className="ml-2">
            The main frontend logic is found in the{" "}
            <code>app/(apps)/voice</code> folder. Components used are found in
            the <code>components/voice</code> folder.
          </span>
        </li>
        <li className="text-l flex">
          <span className="w-4 h-4 mt-1">
            <GearIcon className="w-4 h-4" />
          </span>
          <span className="ml-2">
            Adjust various settings like stability, similarity, and style to
            fine-tune your audio output.
          </span>
        </li>
        <li className="text-l flex">
          <span className="w-4 h-4 mt-1">
            <Link1Icon className="w-4 h-4" />
          </span>
          <span className="ml-2">
            The API endpoints for text-to-speech can be found in{" "}
            <code>app/api/(apps)/voice/*</code>. There are 4 endpoints: (1) get
            available voices, (2) get available models, (3) generate speech and
            (4) upload the audio.
          </span>
        </li>

        <li className="text-l flex">
          <span className="w-4 h-4 mt-1">
            <SpeakerIcon className="w-4 h-4" />
          </span>
          <span className="ml-2">
            Listen to your generated audio directly in the browser with our
            built-in audio player.
          </span>
        </li>
        <li className="text-l flex">
          <span className="w-4 h-4 mt-1">
            <BookIcon className="w-4 h-4" />
          </span>
          <span className="ml-2">
            Explore different AI models for voice generation in the settings.
          </span>
        </li>
        <li className="text-l flex">
          <span className="w-4 h-4 mt-1">
            <RocketIcon className="w-4 h-4" />
          </span>
          <span className="ml-2">Ready to give it a try? Go ahead!</span>
        </li>
      </ul>
    </AppInfo>
  );
}
