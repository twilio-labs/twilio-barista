import twilio from "twilio";
import { writeFileSync } from "fs";
import { Stages } from "@/lib/utils";

const {
  TWILIO_API_KEY = "",
  TWILIO_API_SECRET = "",
  TWILIO_ACCOUNT_SID = "",
  TWILIO_SYNC_SERVICE_SID = "",
} = process.env;

const client = twilio(TWILIO_API_KEY, TWILIO_API_SECRET, {
  accountSid: TWILIO_ACCOUNT_SID,
});

(async () => {
  //fetch all attendees and write to csv file with header columns
  const map = await client.sync.v1
    .services(TWILIO_SYNC_SERVICE_SID)
    .syncMaps("ActiveCustomers");
  try {
    const mapItems = await map.syncMapItems.list({ limit: 1000 });
    const attendees = mapItems
      .map((item) => item.data)
      .filter(
        (a) =>
          a.stage === Stages.VERIFIED_USER ||
          a.stage === Stages.FIRST_ORDER ||
          a.stage === Stages.REPEAT_CUSTOMER,
      );
    const csv = attendees.map((attendee) => {
      return `${attendee.email},${attendee.event},${attendee.stage}`;
    });
    writeFileSync("attendees.csv", `Email,Event,Stage\n${csv.join("\n")}`);
  } catch (e) {
    console.error(e);
  }
})();
