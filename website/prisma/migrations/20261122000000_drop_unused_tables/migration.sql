-- DropForeignKey
ALTER TABLE "CourseCategory" DROP CONSTRAINT "CourseCategory_courseId_fkey";

-- DropForeignKey
ALTER TABLE "CourseCategory" DROP CONSTRAINT "CourseCategory_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "Attachment" DROP CONSTRAINT "Attachment_courseId_fkey";

-- DropForeignKey
ALTER TABLE "LessonSection" DROP CONSTRAINT "LessonSection_lessonId_fkey";

-- DropForeignKey
ALTER TABLE "Challenge" DROP CONSTRAINT "Challenge_chapterId_fkey";

-- DropForeignKey
ALTER TABLE "ChallengeTask" DROP CONSTRAINT "ChallengeTask_challengeId_fkey";

-- DropForeignKey
ALTER TABLE "MuxData" DROP CONSTRAINT "MuxData_lessonId_fkey";

-- DropForeignKey
ALTER TABLE "ArticleSection" DROP CONSTRAINT "ArticleSection_articleId_fkey";

-- DropTable
DROP TABLE "Category";

-- DropTable
DROP TABLE "CourseCategory";

-- DropTable
DROP TABLE "Attachment";

-- DropTable
DROP TABLE "LessonSection";

-- DropTable
DROP TABLE "Challenge";

-- DropTable
DROP TABLE "ChallengeTask";

-- DropTable
DROP TABLE "MuxData";

-- DropTable
DROP TABLE "Article";

-- DropTable
DROP TABLE "ArticleSection";

-- DropTable
DROP TABLE "StripeCustomer";

