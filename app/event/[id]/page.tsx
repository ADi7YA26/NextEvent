"use client"

import EventCard from "@/components/EventCard";
import JoinQueue from "@/components/JoinQueue";
import Spinner from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useStorageUrl } from "@/lib/utils";
import { SignInButton, useUser } from "@clerk/nextjs"
import { useQuery } from "convex/react";
import { CalendarDays, MapPin, Ticket, Users } from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";

const EventPage = () => {
  const { user } = useUser();
  const params = useParams();
  const event = useQuery(api.events.getById, {
    eventId: params.id as Id<"events">,
  })
  const availability = useQuery(api.events.getEventAvailability, {
    eventId: params.id as Id<"events">,
  })
  const imageUrl = useStorageUrl(event?.imageStorageId);

  if(!event || !availability){
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    )
  }

  return (
    <main className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="rounded-xl shadow-sm overflow-hidden">
          {imageUrl && (
            <div className="aspect-[21/9] relative w-full">
              <Image 
                src={imageUrl}
                alt={event.name}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          <div className="sm:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-8">
                <div>
                  <h1 className="text-4xl font-bold mb-4">{event.name}</h1>
                  <p className="text-lg text-muted-foreground">{event.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-6 text-popover-foreground">
                  <div className="bg-popover rounded-lg p-4 border">
                    <div className="flex items-center">
                      <CalendarDays className="w-5 h-5 mr-2 text-primary" />
                      <span className="text-sm text-muted-foreground font-medium">Date</span>
                    </div>
                    <p>{new Date(event.eventDate).toLocaleDateString()}</p>
                  </div>

                  <div className="bg-popover rounded-lg p-4 border">
                    <div className="flex items-center">
                      <MapPin className="w-5 h-5 mr-2 text-primary" />
                      <span className="text-sm text-muted-foreground font-medium">Location</span>
                    </div>
                    <p>{event.location}</p>
                  </div>

                  <div className="bg-popover rounded-lg p-4 border">
                    <div className="flex items-center">
                      <Ticket className="w-5 h-5 mr-2 text-primary" />
                      <span className="text-sm text-muted-foreground font-medium">Price</span>
                    </div>
                    <p>&#8377;{event.price.toFixed(2)}</p>
                  </div>
                  
                  <div className="bg-popover rounded-lg p-4 border">
                    <div className="flex items-center">
                      <Users className="w-5 h-5 mr-2 text-primary" />
                      <span className="text-sm text-muted-foreground font-medium">Availability</span>
                    </div>
                    <p> 
                      {availability.totalTickets - availability.purchasedCount}{" "}
                      / {availability.totalTickets} left
                    </p>
                  </div>
                </div>

                <div className="bg-card border rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-primary mb-2">
                    Event Information
                  </h3>
                  <ul className="space-y-2 text-accent-foreground">
                    <li>• Please arrive 30 minutes before the event starts</li>
                    <li>• Tickets are non-refundable</li>
                    <li>• Age restriction: 18+</li>
                  </ul>
                </div>
              </div>

              <div>
                <div className="sticky top-8 space-y-4">
                  <EventCard eventId={params.id as Id<"events">} />

                  {user ? (
                    <JoinQueue
                      eventId={params.id as Id<"events">}
                      userId={user.id}
                    />
                  ) : (
                    <SignInButton mode="modal">
                      <Button size="full">
                        Sign in to buy tickets
                      </Button>
                    </SignInButton>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default EventPage