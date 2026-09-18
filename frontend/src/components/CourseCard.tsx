import { ArrowUpRight, Clock3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Course } from '../types/api';

export function CourseCard({ course }: { course: Course }) { return <article className="group flex h-full flex-col border border-[#d8d2c3] bg-[#fbfaf5] transition hover:-translate-y-1 hover:border-[#d86445]">
  <div className="relative h-40 overflow-hidden bg-[#193b31]">{course.thumbnailUrl ? <img src={course.thumbnailUrl} alt="" className="h-full w-full object-cover" /> : <div className="h-full w-full bg-[linear-gradient(135deg,#193b31_0%,#2e6656_60%,#d86445_60%,#d86445_100%)]" />}<span className="absolute left-4 top-4 bg-[#edbd61] px-2 py-1 font-sans text-[10px] font-bold uppercase tracking-widest">{course.level}</span></div>
  <div className="flex flex-1 flex-col p-5"><p className="font-sans text-xs font-bold uppercase tracking-widest text-[#d86445]">{course.category?.name ?? 'SkillForge course'}</p><h3 className="mt-2 text-2xl leading-tight">{course.title}</h3><p className="mt-3 flex-1 font-sans text-sm leading-6 text-[#657066]">{course.shortDescription}</p><div className="mt-5 flex items-center justify-between border-t border-[#e6e1d6] pt-4 font-sans text-xs text-[#657066]"><span className="flex items-center gap-1"><Clock3 size={14} /> Self-paced</span><Link to={`/courses/${course.slug}`} className="flex items-center gap-1 font-bold text-[#18221d]">View course <ArrowUpRight size={15} /></Link></div></div>
</article>; }
