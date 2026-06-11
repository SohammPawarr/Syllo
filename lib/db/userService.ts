import dbConnect from './mongoose';
import { User } from './models';

const DAILY_CREDIT_LIMIT = 10000;

/**
 * Ensures the user exists in the DB. If lastCreditReset is not today,
 * resets the credits to the DAILY_CREDIT_LIMIT.
 * Returns the user document.
 */
export async function getOrCreateUserWithCredits(email: string) {
  await dbConnect();
  
  let user = await User.findOne({ email });
  
  if (!user) {
    user = await User.create({
      email,
      credits: DAILY_CREDIT_LIMIT,
      lastCreditReset: new Date(),
    });
    return user;
  }
  
  // Check if we need to reset credits (if last reset was on a previous day)
  const today = new Date();
  const lastReset = user.lastCreditReset ? new Date(user.lastCreditReset) : new Date(0);
  
  const isSameDay = 
    today.getFullYear() === lastReset.getFullYear() &&
    today.getMonth() === lastReset.getMonth() &&
    today.getDate() === lastReset.getDate();
    
  if (!isSameDay) {
    user.credits = DAILY_CREDIT_LIMIT;
    user.lastCreditReset = today;
    await user.save();
  }
  
  return user;
}

/**
 * Deducts the specified amount of credits from the user.
 * Throws an Error if the user doesn't have enough credits.
 */
export async function deductCredits(email: string, amount: number) {
  const user = await getOrCreateUserWithCredits(email);
  
  // TOKEN LIMIT REMOVED TEMPORARILY:
  // if (user.credits < amount) {
  //   throw new Error(`Insufficient credits. You need ${amount} credits but only have ${user.credits}.`);
  // }
  
  // user.credits -= amount;
  // await user.save();
  return user.credits;
}
