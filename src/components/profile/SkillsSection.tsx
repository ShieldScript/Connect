'use client';

import { useRouter } from 'next/navigation';
import { InterestWithProficiency } from '@/types';

interface SkillsSectionProps {
  interests: InterestWithProficiency[];
}

export function SkillsSection({ interests }: SkillsSectionProps) {
  const router = useRouter();

  // Debug: Log all interests with their proficiency levels
  console.log('All interests:', interests.map(i => ({ name: i.name, proficiencyLevel: i.proficiencyLevel })));

  // Categorize skills by proficiency (1=Learner, 2=Practitioner, 3=Mentor)
  const mentorSkills = interests.filter(i => i.proficiencyLevel === 3);
  const practitionerSkills = interests.filter(i => i.proficiencyLevel === 2);
  const learnerSkills = interests.filter(i => i.proficiencyLevel === 1);

  console.log('Mentor skills:', mentorSkills.map(i => i.name));
  console.log('Practitioner skills:', practitionerSkills.map(i => i.name));
  console.log('Learner skills:', learnerSkills.map(i => i.name));

  return (
    <section className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest">
          STEWARDSHIP TOOLKIT
        </h2>
        <button
          onClick={() => router.push('/profile/update-skills')}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 uppercase tracking-wide"
        >
          EDIT SKILLS
        </button>
      </div>

      <div className="space-y-4">
        {/* Mentor Skills */}
        {mentorSkills.length > 0 && (
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              MENTOR
            </h3>
            <div className="flex gap-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {mentorSkills.map(skill => (
                <span
                  key={skill.id}
                  className="px-3 py-1.5 bg-amber-50 text-amber-800 rounded border border-amber-300 text-sm font-bold whitespace-nowrap flex-shrink-0"
                >
                  {skill.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Practitioner Skills */}
        {practitionerSkills.length > 0 && (
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              PRACTITIONER
            </h3>
            <div className="flex gap-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {practitionerSkills.map(skill => (
                <span
                  key={skill.id}
                  className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded border border-blue-200 text-sm font-semibold whitespace-nowrap flex-shrink-0"
                >
                  {skill.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Learner Skills */}
        {learnerSkills.length > 0 && (
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              LEARNING
            </h3>
            <div className="flex gap-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {learnerSkills.map(skill => (
                <span
                  key={skill.id}
                  className="px-3 py-1.5 bg-gray-50 text-gray-600 rounded border border-gray-200 text-sm whitespace-nowrap flex-shrink-0"
                >
                  {skill.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {interests.length === 0 && (
          <p className="text-sm text-gray-500 italic">
            No skills selected yet. Click "EDIT SKILLS" to get started.
          </p>
        )}
      </div>
    </section>
  );
}
