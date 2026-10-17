import { Job } from "./atoms";

export function calculateNextOccurrence(
    currentDate: Date,
    recurrenceRule: NonNullable<Job["recurrenceRule"]>
): Date {
    const nextDate = new Date(currentDate);

    switch (recurrenceRule.frequency) {
        case "DAILY":
            nextDate.setDate(nextDate.getDate() + recurrenceRule.interval);
            break;
        case "WEEKLY":
            nextDate.setDate(nextDate.getDate() + 7 * recurrenceRule.interval);
            break;
        case "MONTHLY":
            nextDate.setMonth(nextDate.getMonth() + recurrenceRule.interval);
            break;
        case "YEARLY":
            nextDate.setFullYear(
                nextDate.getFullYear() + recurrenceRule.interval
            );
            break;
    }

    return nextDate;
}

export function shouldCreateNextRecurringJob(
    job: Job,
    newStatus: string
): boolean {
    return (
        newStatus === "completed" &&
        job.isRecurring === true &&
        job.recurrenceRule !== null &&
        job.recurrenceRule !== undefined
    );
}
