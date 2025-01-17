import { internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { DURATIONS, WAITING_LIST_STATUS } from "./constants";
import { getEventAvailability } from "./events";
import { internal } from "./_generated/api";

export const getQueuePosition = query({
  args: {
    eventId: v.id("events"),
    userId: v.string(),
  },
  handler: async ( ctx, { eventId, userId }) => {
    // get entry for this specific user and event combination
    const entry  = await ctx.db
      .query("waitingList")
      .withIndex("by_user_event", (q)=>
        q.eq("userId", userId).eq("eventId", eventId)
      )
      .filter((q) => q.neq(q.field("status"), WAITING_LIST_STATUS.EXPIRED))
      .first();

    if(!entry) return null;
    
    // get total number of people ahead in line
    const peopleAhead = await ctx.db
      .query("waitingList")
      .withIndex("by_event_status", (q)=>q.eq("eventId", eventId))
      .filter((q) => 
        q.and(
          // get all entries before this one 
          q.lt(q.field("_creationTime"), entry._creationTime),
          // only get entries that are either waiting or offered
          q.or(
            q.eq(q.field("status"), WAITING_LIST_STATUS.WAITING),
            q.eq(q.field("status"), WAITING_LIST_STATUS.OFFERED)
          )
        )
      )
      .collect()
      .then((entries)=> entries.length);

    return {
      ...entry,
      position: peopleAhead + 1,
    };
  },
})

export const expireOffer = internalMutation({
  args: {
    waitingListId: v.id("waitingList"),
    eventId: v.id("events")
  },
  handler: async (ctx, { waitingListId, eventId }) => {
    const offer = await ctx.db.get(waitingListId);
    if(!offer || offer.status !== WAITING_LIST_STATUS.OFFERED) return;

    await ctx.db.patch(waitingListId, {
      status: WAITING_LIST_STATUS.EXPIRED
    });

    await processQueue(ctx, { eventId });
  }
})

// function to process waiting list queue and offer tickets to next eligible user
// check current availability considering purchased tickets and active offers.
export const processQueue = mutation({
  args: {
    eventId: v.id("events")
  },
  handler: async (ctx, { eventId }) => {
    const { availableSpots } = await getEventAvailability(ctx, {eventId});
    if(availableSpots <= 0) return;

    // get next users in line
    const waitingUsers = await ctx.db
      .query("waitingList")
      .withIndex("by_event_status", (q) => q.eq("eventId", eventId).eq("status", WAITING_LIST_STATUS.WAITING))
      .order("asc")
      .take(availableSpots);

    const now = Date.now();
    for (const user of waitingUsers) {
      // update the waiting list entry to OFFERED
      await ctx.db.patch(user._id, {
        status: WAITING_LIST_STATUS.OFFERED,
        offerExpiresAt: now + DURATIONS.TICKET_OFFER,
      });

      // schedule expiration job for this offer
      await ctx.scheduler.runAfter(
        DURATIONS.TICKET_OFFER,
        internal.waitingList.expireOffer,
        {
          waitingListId: user._id,
          eventId,
        }
      );
    }
  }
})

export const releaseTicket = mutation({
  args: {
    eventId: v.id("events"),
    waitingListId: v.id("waitingList"),
  },
  handler: async (ctx, { eventId, waitingListId }) => {
    const entry = await ctx.db.get(waitingListId);

    if(!entry || entry.status !== WAITING_LIST_STATUS.OFFERED){
      throw new Error("No valid ticket offer found");
    }

    // mark the entry expired 
    await ctx.db.patch(waitingListId, {
      status: WAITING_LIST_STATUS.EXPIRED
    })

    // process the queue to offer ticket to the next person
    await processQueue(ctx, { eventId })
  }
})