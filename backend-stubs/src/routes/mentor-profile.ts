import { Router } from "express";
import { z } from "zod";
import { getBySlug, getByMentorId, listPublished, update, setSlug, setPublished } from "../services/mentor-profile.js";

const router = Router();

// Public route — no auth, dùng cho /portal/m/:slug
router.get("/public/by-slug/:slug", (req, res) => {
  const profile = getBySlug(req.params.slug);
  if (!profile || !profile.published) return res.status(404).json({ error: "Mentor not found or not published" });
  res.json(profile);
});

router.get("/public/list", (_req, res) => {
  res.json(listPublished());
});

// Authenticated (mentor sửa profile của mình)
router.get("/me", (req, res) => {
  const profile = getByMentorId(req.mentorId);
  if (!profile) return res.status(404).json({ error: "Profile chưa khởi tạo" });
  res.json(profile);
});

const updateSchema = z.object({
  name: z.string().optional(),
  short: z.string().optional(),
  title: z.string().optional(),
  avatarBg: z.string().optional(),
  tags: z.array(z.string()).optional(),
  headline: z.string().optional(),
  bio: z.string().optional(),
  expertise: z.array(z.string()).optional(),
  yearsExperience: z.number().optional(),
  avatarUrl: z.string().optional(),
  coverUrl: z.string().optional(),
  links: z.array(z.object({
    type: z.enum(["linkedin", "facebook", "youtube", "tiktok", "github", "personal"]),
    url: z.string().url(),
  })).optional(),
  publicCourseIds: z.array(z.string()).optional(),
  testimonials: z.array(z.object({
    studentName: z.string(),
    quote: z.string(),
    courseName: z.string().optional(),
    rating: z.number().min(1).max(5),
  })).optional(),
});
router.patch("/me", (req, res) => {
  try {
    res.json(update(req.mentorId, updateSchema.parse(req.body)));
  } catch (e) {
    res.status(404).json({ error: (e as Error).message });
  }
});

const slugSchema = z.object({ slug: z.string() });
router.put("/me/slug", (req, res) => {
  const body = slugSchema.parse(req.body);
  try {
    res.json(setSlug(req.mentorId, body.slug));
  } catch (e) {
    const err = e as Error & { code?: number };
    res.status(err.code ?? 400).json({ error: err.message });
  }
});

const publishedSchema = z.object({ published: z.boolean() });
router.put("/me/published", (req, res) => {
  try {
    res.json(setPublished(req.mentorId, publishedSchema.parse(req.body).published));
  } catch (e) {
    res.status(404).json({ error: (e as Error).message });
  }
});

export default router;
