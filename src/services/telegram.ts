import axios from "axios";
import { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } from "../config/env";

export async function sendTelegramMessage(message: string): Promise<void> {
  console.log("BOT_TOKEN:", process.env.TELEGRAM_BOT_TOKEN);
  console.log("CHAT_ID:", process.env.TELEGRAM_CHAT_ID);

  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

  await axios.post(url, {
    chat_id: TELEGRAM_CHAT_ID,
    text: message,
  });
}
