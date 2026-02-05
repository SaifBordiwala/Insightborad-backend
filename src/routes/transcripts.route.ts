import { Router, Request, Response, NextFunction } from "express";
import { processTranscript } from "../services/transcript.service";

const router = Router();

router.post(
  "/",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { transcript } = req.body ?? {};

      if (typeof transcript !== "string" || transcript.trim().length === 0) {
        res.status(400).json({ message: "Field 'transcript' is required." });
        return;
      }

      const result = await processTranscript(transcript);

      res.status(200).json({
        hash: result.hash,
        tasks: result.tasks,
        createdAt: result.createdAt,
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
