"use client"

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { Ticket } from "lucide-react";
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import ReleaseTicket from "./ReleaseTicket";

const PurchaseTicket = ({ eventId }: { eventId: Id<"events"> }) => {
  const { user } = useUser();
  const router = useRouter();
  const queuePosition = useQuery(api.waitingList.getQueuePosition, {
    eventId,
    userId: user?.id ?? ""
  })

  const [timeRemaining, setTimeRemaining] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const offerExpiresAt = queuePosition?.offerExpiresAt ?? 0;
  const isExpired = Date.now() > offerExpiresAt;

  useEffect(() => {
    const calculateTimeRemaining = () => {
      if (isExpired) {
        setTimeRemaining("Expired");
        return;
      }

      const diff = offerExpiresAt - Date.now();
      const minutes = Math.floor(diff / 1000 / 60);
      const seconds = Math.floor((diff / 1000) % 60);

      if (minutes > 0) {
        setTimeRemaining(
          `${minutes} minute${minutes === 1 ? "" : "s"} ${seconds} second${seconds === 1 ? "" : "s"
          }`
        );
      } else {
        setTimeRemaining(`${seconds} second${seconds === 1 ? "" : "s"}`);
      }
    };

    calculateTimeRemaining();

    const interval = setInterval(calculateTimeRemaining, 1000);
    return () => clearInterval(interval);
  }, [offerExpiresAt, isExpired]);

  const handlePurchase = async () => {};

  if (!user || !queuePosition || queuePosition.status !== "offered") {
    return null;
  }

  return (
    <div className="bg-card p-6 rounded-xl shadow-lg border">
      <div className="space-y-4">
        <div className="rounded-lg p-6 border">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center">
                <Ticket className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">
                  Ticket Reserved
                </h3>
                <p className="text-sm text-muted-foreground">
                  Expires in {timeRemaining}
                </p>
              </div>
            </div>

            <div className="text-sm text-muted-foreground leading-relaxed">
              A ticket has been reserved for you. Complete your purchase before
              the timer expires to secure your spot at this event.
            </div>
          </div>
        </div>

        <Button
          onClick={handlePurchase}
          disabled={isExpired || isLoading}
          variant="golden"
          size="full"
        >
          {isLoading
            ? "Redirecting to checkout..."
            : "Purchase Your Ticket Now →"}
        </Button>

        <div className="mt-4">
          <ReleaseTicket eventId={eventId} waitingListId={queuePosition._id} />
        </div>
      </div>
    </div>
  )
}


export default PurchaseTicket