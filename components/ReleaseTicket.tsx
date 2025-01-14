"use client"

import { Id } from "@/convex/_generated/dataModel";
import { XCircle } from "lucide-react";
import { Button } from "./ui/button";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const ReleaseTicket = ({
  eventId,
  waitingListId,
}: {
  eventId: Id<"events">;
  waitingListId: Id<"waitingList">;
}) => {
  const [isReleasing, setIsReleasing] = useState(false);
  const releaseTicket = useMutation(api.waitingList.releaseTicket);
  const { toast } = useToast()

  const handleRelease = async () => {
    if (!confirm("Are you sure you want to release your ticket offer?")) return;

    try {
      setIsReleasing(true);
      await releaseTicket({
        eventId,
        waitingListId,
      });
    } catch (error) {
      console.error("Error releasing ticket:", error);
      toast({
        variant: "destructive",
        description: "Error releasing ticket.",
      })
    } finally {
      setIsReleasing(false);
    }
  };

  return (
    <Button
      onClick={handleRelease}
      disabled={isReleasing}
      variant="secondary"
    >
      <XCircle className="w-4 h-4" />
      {isReleasing ? "Releasing..." : "Release Ticket Offer"}
    </Button>
  );
}

export default ReleaseTicket