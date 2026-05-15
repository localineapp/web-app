"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useSession } from "@/lib/auth-client";
import { RefreshCcwIcon } from "lucide-react";
import { MouseEvent, useState } from "react";
import { toast } from "sonner";

export default function DataExportCard({ session }: { session: ReturnType<typeof useSession>["data"] }) {
  const [loading, setLoading] = useState(false)

  const handleDataExport = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setLoading(true)

    setTimeout(() => {
      toast.success("Data export request submitted successfully. You will receive an email with the download link once it's ready.")
      setLoading(false)
    }, 2000)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>
          Data Export
          <span className="rounded-md bg-muted px-1 text-xs text-muted-foreground ml-1">
            Coming soon
          </span>
        </CardTitle>
        <CardDescription>
          Request a copy of all your personal data that we have collected.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Button
          variant="outline"
          disabled={loading || true}
          onClick={handleDataExport}
        >
          {loading ? (
            <>
              <Spinner className="me-1" />
              Requesting Data Export...
            </>
          ) : (
            <>
              <RefreshCcwIcon className="me-1" />
              Request Data Export
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}