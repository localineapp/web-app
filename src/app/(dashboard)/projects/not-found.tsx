import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { AlertTriangleIcon, HomeIcon } from "lucide-react"
import Link from "next/link"

export default function NotFoundPage() {
  return (
    <div className="flex min-h-full flex-col">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <AlertTriangleIcon />
          </EmptyMedia>

          <EmptyTitle className="text-4xl">Project Not Found</EmptyTitle>

          <EmptyDescription className="text-lg">
            The project you are looking for does not exist.
          </EmptyDescription>
        </EmptyHeader>

        <EmptyContent className="flex-row justify-center gap-2">
          <Button asChild size="lg">
            <Link href="/">
              <HomeIcon className="mr-2 h-5 w-5" />
              Go back to dashboard
            </Link>
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  )
}
