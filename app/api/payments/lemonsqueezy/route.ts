import crypto from "crypto";
import { type Payload } from "@/lib/types/lemonsqueezy";
import {
  checkUserProfile,
  updateUserProfile,
  updatePurchasesTable,
  addUserCredits,
} from "@/lib/hooks/userData";

const isError = (error: unknown): error is Error => {
  return error instanceof Error;
};

export async function POST(request: Request) {
  if (!process.env.LEMON_SQUEEZY_WEBHOOK_SECRET) {
    return new Response(
      "Please set your LemonSqueezy webhook secret in your .env file.",
      {
        status: 500,
      }
    );
  }

  try {
    const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;
    const text = await request.text();
    const hmac = crypto.createHmac("sha256", secret || "");
    const digest = Buffer.from(hmac.update(text).digest("hex"), "utf8");
    const signature = Buffer.from(
      request.headers.get("x-signature") as string,
      "utf8"
    );

    if (!crypto.timingSafeEqual(digest, signature)) {
      return new Response("Invalid signature.", {
        status: 400,
      });
    }

    const payload = JSON.parse(text);

    const {
      meta: { event_name: eventName },
      data: { attributes, id },
    } = payload as Payload;

    const userEmail = attributes.user_email;

    // Check if the user exists in the database
    const UserProfile = await checkUserProfile(userEmail);

    switch (eventName) {
      case "order_created":
        if ("first_order_item" in attributes) {
          let purchaseType: string | null = null;

          // Check which product was purchased
          const variantId = attributes.first_order_item.variant_id;
          const status = attributes.status;

          // Here is where you define, per product ID, what needs to be updated in the 'purchase' column of the user profile ('profiles' table in Supabase)
          // You can grant access based on this column in your application
          switch (variantId) {
            case 372993:
              purchaseType = "awp-small";
              break;
            case 372998:
              purchaseType = "awp-large";
              break;
            case 402332:
              purchaseType = "credits-small";
              break;
            case 402333:
              purchaseType = "credits-large";
              break;
            default:
              console.log("Unrecognized product ID, no update applied.");
              return new Response(
                "Unrecognized product ID, no update applied.",
                {
                  status: 200,
                }
              );
          }

          // Always store the purchase in the database
          await updatePurchasesTable(userEmail, id, attributes, purchaseType);

          // If no user is found with this email, return a message
          if (!UserProfile) {
            console.log("No user found with this email");
            return new Response(
              "No user found with this email, but purchase was stored in database!",
              {
                status: 200,
              }
            );
          }

          // Otherwise, we update the user profile with the purchase type
          if (status === "paid") {
            await updateUserProfile(userEmail, purchaseType);

            // If you choose to use the credits system, you can add credits to the user's profile here
            if (purchaseType === "credits-small") {
              await addUserCredits(userEmail, 50);
            } else if (purchaseType === "credits-large") {
              await addUserCredits(userEmail, 100);
            }
          }

          console.log("Purchased product: ", variantId);
        }
        break;
      case "order_refunded":
      case "subscription_created":
        // Do stuff here if you are using subscriptions
        console.log(attributes);
        break;
      case "subscription_cancelled":
      case "subscription_resumed":
      case "subscription_expired":
      case "subscription_paused":
      case "subscription_unpaused":
      case "subscription_payment_failed":
      case "subscription_payment_success":
      case "subscription_payment_recovered":
      default:
        throw new Error(`Unhandled event: ${eventName}`);
    }
  } catch (error: unknown) {
    if (isError(error)) {
      return new Response(`Webhook error: ${error.message}`, {
        status: 400,
      });
    }

    return new Response("Webhook error", {
      status: 400,
    });
  }

  return new Response(null, {
    status: 200,
  });
}
