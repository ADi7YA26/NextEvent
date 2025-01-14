"use client"

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel"
import { useStorageUrl } from "@/lib/utils";
import { useUser } from "@clerk/nextjs"
import { useQuery } from "convex/react";
import { CalendarDays, Check, CircleArrowRight, LoaderCircle, MapPin, PencilIcon, StarIcon, Ticket, XCircle } from "lucide-react";
import Image from "next/image";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

const EventCard = ( {eventId}  : { eventId: Id<"events">}) => {

  const { user } = useUser();
  const router = useRouter();
  const event = useQuery(api.events.getById, {eventId});
  const availability = useQuery(api.events.getEventAvailability, {eventId});
  
  const userTicket = useQuery(api.tickets.getUserTicketForEvent, {
    eventId,
    userId: user?.id ?? ""
  })

  const queuePosition = useQuery(api.waitingList.getQueuePosition, {
    eventId,
    userId: user?.id ?? "",
  })

  const imageUrl = useStorageUrl(event?.imageStorageId);

  if(!event || !availability){
    return null;
  }
  
  const isPastEvent = event.eventDate < Date.now();
  const isEventOwner = user?.id === event?.userId;

  const renderQueuePosition = () => {
    if(!queuePosition || queuePosition.status !== "waiting") return null;

    if(availability.purchasedCount >= availability.totalTickets){
      return (
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center text-muted-foreground">
            <Ticket className="w-5 h-5 mr-2" />
            <span>Event is sold out</span>
          </div>
        </div>
      );
    }

    if(queuePosition.position === 2){
      return (
        <div className="flex flex-col text-primary items-center justify-between p-3 rounded-lg border">
          <div className="flex items-center">
            <CircleArrowRight className="w-5 h-5 mr-2" />
            <span className="font-medium">
              You&apos;re next in line! (Queue Position: {" "}
              {queuePosition.position})
            </span>
          </div>
          <div className="flex items-center">
            <LoaderCircle className="w-4 h-4 mr-1 animate-spin" />
            <span className="text-sm">Waiting for ticket</span>
          </div>
        </div>
      )
    }

    return(
      <div className="flex items-center justify-between p-3 text-accent-foreground bg-accent rounded-lg border">
        <div className="flex items-center">
          <span>Queue Position</span>
        </div>
        <span className="px-3 py-1 rounded-full font-medium">3</span>
      </div>
    )

  }


  const renderTicketStatus = () => {
    if(!user) return null;

    if(isEventOwner){
      return (
        <div className="mt-4">
          <Button variant="ghost" className="w-full" onClick={(e) => {
            e.stopPropagation();
            router.push(`/seller/events/${eventId}/edit`)
          }}>
            <PencilIcon />
            Edit Event
          </Button>
        </div>
      )
    }

    if(userTicket){
      return(
        <div className="mt-4 flex items-center justify-between p-3 rounded-lg border">
          <div className="flex item-center">
            <Check className="text-green-600 mr-2" />   
            <span className="text-green-700 font-medium">
              You have a ticket!
            </span>
          </div>
          <Button className="rounded-full bg-green-700 hover:bg-green-900"
            onClick={(e) => {e.stopPropagation(); router.push(`/tickets/${userTicket._id}`)}}
          >
            View your ticket
          </Button>
        </div>
      )
    }

    if(queuePosition){
      return(
        <div className="mt-4">
          {queuePosition.status === "offered" && (
            // <PurchaseTicket eventId={eventId} />
            <div> adf </div>
          )}
          {renderQueuePosition()} 
          {queuePosition.status === "expired" && (
            <div className="p3 bg-red-50 rounded-lg border border-red-100">
              <span className="text-red-700 font-medium flex items-center">
                <XCircle className="w-5 h-5 mr-2" />
                Offer expired
              </span>
            </div>
          )}
        </div>
      )
    }
  }

  return (
    <div 
      onClick={() => router.push(`/event/${eventId}`)}  
      className={`rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border cursor-pointer overflow-hidden relative ${
        isPastEvent ? "opacity-75 hover:opacity-100" : ""
      }`}
    >
      {imageUrl && (
        <div className="relative w-full h-48">
          <Image src={imageUrl} alt={event.name} fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        </div>
      )}
      
      <div className={`p-6 ${imageUrl ? "relative" : ""}`}>
        <div className="flex justify-between items-start">

          <div>
            <div className="flex flex-col items-start gap-2">
              {isEventOwner && (
                <span className="inline-flex items-center gap-1 bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-medium">
                  <StarIcon className="w-3 h-3" />
                  Your Event
                </span>
              )}
              <h2 className="text-xl font-semibold">{event.name}</h2>
            </div>
            {isPastEvent && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground mt-2">
                Past Event
              </span>
            )}
          </div>
          <div className="flex flex-col items-end gap-2 ml-4">
            <span
              className={`px-4 py-1.5 text-sm font-semibold rounded-full ${
                isPastEvent
                  ? "bg-secondary text-secondary-foreground"
                  : "bg-green-50 text-green-700"
              }`}
            >
              ₹{event.price.toFixed(2)}
            </span>
            {availability.purchasedCount >= availability.totalTickets && (
              <span className="px-4 py-1.5 bg-destructive text-destructive-foreground font-semibold rounded-full text-sm">
                Sold Out
              </span>
            )}
          </div>
        </div>

        <div className="mt-4 space-y-3 text-sm text-muted-foreground">
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-2" />
            <span>{event.location}</span>
          </div>

          <div className="flex items-center">
            <CalendarDays className="w-4 h-4 mr-2" />
            <span>
              {new Date(event.eventDate).toLocaleDateString()}{" "}
              {isPastEvent && "(Ended)"}
            </span>
          </div>

          <div className="flex items-center">
            <Ticket className="w-4 h-4 mr-2" />
            <span>
              {availability.totalTickets - availability.purchasedCount} /{" "}
              {availability.totalTickets} available
              {!isPastEvent && availability.activeOffers > 0 && (
                <span className="text-amber-600 text-sm ml-2">
                  ({availability.activeOffers}{" "}
                  {availability.activeOffers === 1 ? "person" : "people"} trying
                  to buy)
                </span>
              )}
            </span>
          </div>
        </div>

        <p className="mt-4 text-sm line-clamp-2 text-muted-foreground">
          {event.description}
        </p>

        <div>
          {!isPastEvent && renderTicketStatus()}
        </div>
      </div>
      
    </div>
  )
}

export default EventCard;