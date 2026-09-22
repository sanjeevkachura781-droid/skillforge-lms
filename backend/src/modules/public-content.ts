// Public outlines expose full content only for explicitly previewable lessons.
export function publicLesson<T extends { toJSON(): object }>(lesson: T) {
  const data = lesson.toJSON() as Record<string, unknown>;
  if (!data.isPreview) { delete data.content; delete data.videoUrl; }
  return data;
}

export function publicCourse(course: { toJSON(): object }) {
  const data = course.toJSON() as Record<string, unknown>;
  const modules = data.modules as Array<{ lessons?: Array<Record<string, unknown>> }> | undefined;
  for (const module of modules ?? []) {
    for (const lesson of module.lessons ?? []) {
      if (!lesson.isPreview) { delete lesson.content; delete lesson.videoUrl; }
    }
  }
  return data;
}
