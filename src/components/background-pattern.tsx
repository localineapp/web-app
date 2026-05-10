import { File, Globe, Key, Languages, Tag, Users, Zap } from "lucide-react";

export function BackgroundPattern() {
  return (
    <div className="absolute inset-0 opacity-[0.03]">
      <div className="absolute top-[10%] left-[15%]">
        <Languages className="h-16 w-16" />
      </div>
      <div className="absolute top-[25%] right-[20%]">
        <Globe className="h-12 w-12" />
      </div>
      <div className="absolute top-[45%] left-[10%]">
        <File className="h-14 w-14" />
      </div>
      <div className="absolute top-[60%] right-[15%]">
        <Key className="h-10 w-10" />
      </div>
      <div className="absolute bottom-[20%] left-[25%]">
        <Users className="h-12 w-12" />
      </div>
      <div className="absolute top-[35%] right-[35%]">
        <Tag className="h-8 w-8" />
      </div>
      <div className="absolute top-[70%] right-[40%]">
        <Zap className="h-11 w-11" />
      </div>
      <div className="absolute bottom-[35%] left-[40%]">
        <Globe className="h-9 w-9" />
      </div>
      <div className="absolute top-[15%] left-[45%]">
        <Languages className="h-10 w-10" />
      </div>
      <div className="absolute bottom-[45%] right-[25%]">
        <File className="h-13 w-13" />
      </div>
    </div>
  )
}