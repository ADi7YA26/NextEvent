"use client"

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel"
import { useToast } from "@/hooks/use-toast"
import { useMutation, useQuery } from "convex/react";
import { ConvexError } from "convex/values";
import { WAITING_LIST_STATUS } from "@/convex/constants";
import { Clock, OctagonXIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";

const JoinQueue = ({ eventId, userId }: {eventId: Id<"events">, userId: string}) => {
  const { toast } = useToast();
  const joinWaitingList = useMutation(api.events.joinWaitingList);
  const queuePosition = useQuery(api.waitingList.getQueuePosition, {
    eventId, userId
  });
  const userTicket = useQuery(api.tickets.getUserTicketForEvent, {
    eventId, userId
  })
  const availability = useQuery(api.events.getEventAvailability, { eventId });
  const event = useQuery(api.events.getById, { eventId });

  const isEventOwner = userId === event?.userId;

  const handleJoinQueue = async () => {
    try{
      const result = await joinWaitingList({ eventId, userId })
      if(result.success)
        toast({
          description: result.message,
        })
    }catch (error){
      if (
        error instanceof ConvexError &&
        error.message.includes("joined the waiting list too many times")
      ) {
        toast({
          variant: "destructive",
          title: "Slow down there!",
          description: error.data,
        });
      } else {
        console.error("Error joining waiting list:", error);
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: "Failed to join queue. Please try again later.",
        });
      }
    }
  }
  
  if(queuePosition === undefined || availability === undefined || !event){
    return <Skeleton className="h-10 w-full" />
  }

  if(userTicket) return null;

  const isPastEvent = event.eventDate < Date.now();

  return (
    <div>
      {(!queuePosition ||
        queuePosition.status === WAITING_LIST_STATUS.EXPIRED ||
        (queuePosition.status === WAITING_LIST_STATUS.OFFERED &&
          queuePosition.offerExpiresAt &&
          queuePosition.offerExpiresAt <= Date.now())) && (
        <>
          {isEventOwner ? (
            <div className="flex items-center justify-center text-muted-foreground gap-2 w-full py-3 px-4 rounded-lg">
              <OctagonXIcon className="w-5 h-5" />
              <span>You cannot buy a ticket for your own event</span>
            </div>
          ) : isPastEvent ? (
            <div className="flex items-center justify-center text-muted-foreground gap-2 w-full py-3 px-4 rounded-lg cursor-not-allowed">
              <Clock className="w-5 h-5" />
              <span>Event has ended</span>
            </div>
          ) : availability.purchasedCount >= availability?.totalTickets ? (
            <div className="text-center p-4">
              <p className="text-lg font-semibold text-muted-foreground">
                Sorry, this event is sold out
              </p>
            </div>
          ) : (
            <Button
              onClick={handleJoinQueue}
              disabled={isPastEvent || isEventOwner}
              size="full"
            >
              Buy Ticket
            </Button>
          )}
        </>
      )}
    </div>
  )
}

export default JoinQueue