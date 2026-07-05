
import { POST as recommendPost } from "../recommend/route";

export async function POST() {
  // Recalculate acts as a manual invocation of the recommend routine
  return recommendPost();
}
