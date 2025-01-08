"use client"

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel"
import { useStorageUrl } from "@/lib/utils";
import { useUser } from "@clerk/nextjs"
import { useQuery } from "convex/react";
import { CalendarDays, MapPin, StarIcon, Ticket } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const EventCard = ( {eventId}  : { eventId: Id<"events">}) => {

  const { user } = useUser();
  const event = useQuery(api.events.getById, {eventId});
  const availability = useQuery(api.events.getEventAvailability, {eventId});

  const imageUrl = useStorageUrl(event?.imageStorageId);

  if(!event || !availability){
    return null;
  }
  
  const isPastEvent = event.eventDate < Date.now();
  const isEventOwner = user?.id === event?.userId;

  return (
    <Link href={`/events/${eventId}`} 
    className={`event-card rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border overflow-hidden relative ${
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

        <div className="mt-4 space-y-3 text-muted-foreground">
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

        {/* <div onClick={(e) => e.stopPropagation()}>
          {!isPastEvent && renderTicketStatus()}
        </div> */}
      </div>
      
    </Link>
  )
}

export default EventCard;