import {
  FileIcon,
  GlobeIcon,
  KeyIcon,
  LanguagesIcon,
  TagIcon,
  UsersIcon,
  ZapIcon,
} from "lucide-react"

export default function BackgroundPattern() {
  return (
    <div className="absolute inset-0 opacity-[0.03]">
      <div className="absolute top-[10%] left-[15%]">
        <LanguagesIcon className="h-16 w-16" />
      </div>
      <div className="absolute top-[25%] right-[20%]">
        <GlobeIcon className="h-12 w-12" />
      </div>
      <div className="absolute top-[45%] left-[10%]">
        <FileIcon className="h-14 w-14" />
      </div>
      <div className="absolute top-[60%] right-[15%]">
        <KeyIcon className="h-10 w-10" />
      </div>
      <div className="absolute bottom-[20%] left-[25%]">
        <UsersIcon className="h-12 w-12" />
      </div>
      <div className="absolute top-[35%] right-[35%]">
        <TagIcon className="h-8 w-8" />
      </div>
      <div className="absolute top-[70%] right-[40%]">
        <ZapIcon className="h-11 w-11" />
      </div>
      <div className="absolute bottom-[35%] left-[40%]">
        <GlobeIcon className="h-9 w-9" />
      </div>
      <div className="absolute top-[15%] left-[45%]">
        <LanguagesIcon className="h-10 w-10" />
      </div>
      <div className="absolute right-[25%] bottom-[45%]">
        <FileIcon className="h-13 w-13" />
      </div>
    </div>
  )
}
