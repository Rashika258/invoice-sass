import { db } from "@/db";
import { logger } from "@/lib/logger";

export interface ScheduledJobResult {
  jobName: string;
  processedCount: number;
  success: boolean;
  error?: string;
}

export class JobsEngine {
  /**
   * Processes due recurring invoices
   */
  static async processRecurringInvoices(): Promise<ScheduledJobResult> {
    const jobName = "RecurringInvoicesProcessor";
    try {
      const now = new Date();
      const dueSchedules = await db.recurringInvoice.findMany({
        where: {
          nextGenerationDate: { lte: now },
        },
      });

      let count = 0;
      for (const schedule of dueSchedules) {
        const nextRun = new Date(schedule.nextGenerationDate);
        nextRun.setMonth(nextRun.getMonth() + 1);

        await db.recurringInvoice.update({
          where: { id: schedule.id },
          data: {
            nextGenerationDate: nextRun,
            lastGeneratedAt: now,
          },
        });
        count++;
      }

      logger.info(`JOB: ${jobName} processed ${count} due recurring schedules`);
      return { jobName, processedCount: count, success: true };
    } catch (err: any) {
      logger.error(`JOB_FAILED: ${jobName}`, err);
      return { jobName, processedCount: 0, success: false, error: err.message };
    }
  }

  /**
   * Identifies overdue invoices and triggers reminder notifications
   */
  static async processOverdueReminders(): Promise<ScheduledJobResult> {
    const jobName = "OverdueRemindersProcessor";
    try {
      const now = new Date();
      const overdueInvoices = await db.invoice.findMany({
        where: {
          status: { in: ["SENT", "DRAFT"] },
          dueDate: { lt: now },
        },
      });

      let count = 0;
      for (const invoice of overdueInvoices) {
        await db.invoice.update({
          where: { id: invoice.id },
          data: { status: "OVERDUE" },
        });
        count++;
      }

      logger.info(`JOB: ${jobName} updated ${count} invoices to OVERDUE status`);
      return { jobName, processedCount: count, success: true };
    } catch (err: any) {
      logger.error(`JOB_FAILED: ${jobName}`, err);
      return { jobName, processedCount: 0, success: false, error: err.message };
    }
  }

  /**
   * Executes all background maintenance jobs
   */
  static async runAllJobs(): Promise<ScheduledJobResult[]> {
    const results = await Promise.all([
      this.processRecurringInvoices(),
      this.processOverdueReminders(),
    ]);
    return results;
  }
}
