import { db } from "../db/store.js";
import type { PublicMentorProfile } from "../db/types.js";

/**
 * Public mentor profile — superset của legacy Portal/MENTORS mock.
 *
 * Slug uniqueness: enforce qua slugIndex map. Khi đổi slug, cập nhật cả 2 chỗ.
 * Render route: /portal/m/:slug → trả subset published=true.
 */

export function getBySlug(slug: string): PublicMentorProfile | null {
  const mentorId = db.mentorProfileSlugIndex.get(slug);
  if (!mentorId) return null;
  const profile = db.mentorProfiles.get(mentorId);
  return profile ?? null;
}

export function getByMentorId(mentorId: string): PublicMentorProfile | null {
  return db.mentorProfiles.get(mentorId) ?? null;
}

export function listPublished(): PublicMentorProfile[] {
  return Array.from(db.mentorProfiles.values())
    .filter((p) => p.published)
    .sort((a, b) => b.studentsCount - a.studentsCount);
}

export interface UpdateProfileInput {
  // Legacy fields
  name?: string;
  short?: string;
  title?: string;
  avatarBg?: string;
  tags?: string[];
  // Editor
  headline?: string;
  bio?: string;
  expertise?: string[];
  yearsExperience?: number;
  avatarUrl?: string;
  coverUrl?: string;
  links?: PublicMentorProfile["links"];
  publicCourseIds?: string[];
  testimonials?: PublicMentorProfile["testimonials"];
}

export function update(mentorId: string, patch: UpdateProfileInput): PublicMentorProfile {
  const profile = db.mentorProfiles.get(mentorId);
  if (!profile) throw new Error(`[mentor-profile] ${mentorId} not found`);
  Object.assign(profile, patch);
  // Sync expertise ↔ tags (canonical = expertise nếu có, fallback tags)
  if (patch.expertise) profile.tags = patch.expertise;
  else if (patch.tags) profile.expertise = patch.tags;
  profile.updatedAt = new Date().toISOString();
  return profile;
}

export function setSlug(mentorId: string, newSlug: string): PublicMentorProfile {
  const profile = db.mentorProfiles.get(mentorId);
  if (!profile) throw new Error(`[mentor-profile] ${mentorId} not found`);
  if (!isSlugValid(newSlug)) throw new Error(`[mentor-profile] slug invalid (lowercase, 2-60 ký tự, gạch ngang)`);
  const owner = db.mentorProfileSlugIndex.get(newSlug);
  if (owner && owner !== mentorId) {
    const err = new Error(`[mentor-profile] slug "${newSlug}" đã có người dùng`);
    (err as Error & { code?: number }).code = 409;
    throw err;
  }
  // Free old slug
  db.mentorProfileSlugIndex.delete(profile.slug);
  profile.slug = newSlug;
  db.mentorProfileSlugIndex.set(newSlug, mentorId);
  profile.updatedAt = new Date().toISOString();
  return profile;
}

export function setPublished(mentorId: string, published: boolean): PublicMentorProfile {
  const profile = db.mentorProfiles.get(mentorId);
  if (!profile) throw new Error(`[mentor-profile] ${mentorId} not found`);
  profile.published = published;
  profile.publishedAt = published ? (profile.publishedAt ?? new Date().toISOString()) : profile.publishedAt;
  profile.updatedAt = new Date().toISOString();
  return profile;
}

function isSlugValid(slug: string): boolean {
  return /^[a-z][a-z0-9-]{1,58}[a-z0-9]$/.test(slug);
}
