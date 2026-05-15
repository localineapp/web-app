"use client"

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { authClient, useSession } from "@/lib/auth-client";
import { TrashIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { MouseEvent, useState } from "react";
import { toast } from "sonner";

export default function DeleteAccountCard({ session }: { session: ReturnType<typeof useSession>["data"] }) {
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [isDialogOpen, setDialogOpen] = useState(false)

  const handleDeleteAccount = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setLoading(true)

    await authClient.deleteUser({
      fetchOptions: {
        onSuccess: () => {
          toast.success("Your account has been successfully deleted.")
          setDialogOpen(false)
          setLoading(false)
          
          router.push("/")
        },
        onError: ({ error }) => {
          toast.error(
            error?.message || "Failed to delete your account. Please try again."
          )
          setDialogOpen(false)
          setLoading(false)
        },
      },
    })
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Delete Account</CardTitle>
        <CardDescription>
          Once you delete your account, there is no going back. Deleting your account will remove all attached data, including projects, from the system.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <AlertDialog open={isDialogOpen} onOpenChange={setDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              disabled={loading}
            >
              <TrashIcon className="me-1" />
              Delete Account
            </Button>
          </AlertDialogTrigger>

          <AlertDialogPortal>
            <AlertDialogOverlay className="bg-red-950/30 backdrop-blur-sm" />
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your account and remove your data from the system.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDeleteAccount}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner className="h-4 w-4" />
                      Deleting account...
                    </>
                  ) : (
                    <>
                      <TrashIcon className="h-4 w-4" />
                      Delete account
                    </>
                  )}
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogPortal>
        </AlertDialog>
      </CardContent>
    </Card>
  )
}