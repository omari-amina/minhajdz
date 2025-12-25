
import { Resource, Lesson, CurriculumStandard, ResourceType } from '../types';

/**
 * Parses a YouTube URL to extract the video ID.
 */
export const getYoutubeId = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

/**
 * Determines file type from MIME type or extension.
 */
export const determineResourceType = (file: File): ResourceType => {
    const mime = file.type;
    const ext = file.name.split('.').pop()?.toLowerCase() || '';

    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return ResourceType.IMAGE;
    if (['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv'].includes(ext)) return ResourceType.VIDEO;
    if (['mp3', 'wav', 'm4a', 'aac', 'ogg'].includes(ext)) return ResourceType.AUDIO;
    if (ext === 'pdf') return ResourceType.PDF;
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return ResourceType.ARCHIVE;
    
    // MIME checks
    if (mime.startsWith('image/')) return ResourceType.IMAGE;
    if (mime.startsWith('video/')) return ResourceType.VIDEO;
    if (mime.startsWith('audio/')) return ResourceType.AUDIO;
    if (mime === 'application/pdf') return ResourceType.PDF;
    
    return ResourceType.DOC;
};

/**
 * Rules-Based Scoring Engine for Resources
 * 
 * Ranking Points:
 * - Lesson ID exact match: +100
 * - Curriculum ID match: +80
 * - Unit name match: +60
 * - Subject + Level + Stream match: +30
 * - Text match (Title/Tags) with Lesson Title: +20
 * - Used before in same lesson context: +20
 * - Favorite: +10
 */
export const getResourceSuggestions = (
    lesson: Lesson, 
    allResources: Resource[],
    curriculumItems: CurriculumStandard[]
): Resource[] => {
    const lessonCurriculum = curriculumItems.find(c => c.id === lesson.curriculumId);
    const lessonTitleWords = lesson.title.split(' ').filter(w => w.length > 3);

    const scored = allResources.map(res => {
        let score = 0;

        // 1. Direct Links
        if (res.links?.lessonId === lesson.id) score += 100;
        if (lesson.curriculumId && res.links?.curriculumId === lesson.curriculumId) score += 80;

        // 2. Unit Context (Strong link)
        if (res.links?.unit === lesson.unit && lesson.unit) score += 60;
        
        // 3. Broad Context (Subject/Level)
        if (res.links?.subject === lesson.subject && res.links?.level && lesson.classIds.length > 0) {
             // Checking strictly is hard without Class objects, but we can check broad subject match
             score += 30; 
        }

        // 4. Text Analysis (Rules-based NLP replacement)
        let textMatches = 0;
        lessonTitleWords.forEach(word => {
            if (res.title.includes(word) || res.tags.some(t => t.includes(word))) textMatches++;
        });
        score += Math.min(textMatches * 10, 40); // Max 40 points for text match

        // 5. Usage & Favorites
        if (res.usageCount > 0) score += Math.min(res.usageCount, 20); // Cap at 20
        if (res.isFavorite) score += 10;

        return { ...res, score };
    });

    // Filter out low relevance (e.g., score < 10) and sort
    return scored
        .filter(r => r.score > 10)
        .sort((a, b) => b.score - a.score)
        .slice(0, 10); // Return top 10
};
