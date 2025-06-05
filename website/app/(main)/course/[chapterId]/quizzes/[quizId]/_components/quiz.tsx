"use client"

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { QuizQuestionComponent } from "./quiz-question";
import axios from "axios";
import { useAuth } from "@clerk/nextjs";
import { QuizQuestion, QuizResult } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { GrFormNextLink } from "react-icons/gr";
import { useRouter } from "next/navigation";

interface QuizProps {
    quiz: { id: string; title: string; description: string | null };
    questions: {
        id: string;
        position: number;
        question: string;
        options: string[];
        answers: string[];
        points: number;
        note: string | null;
    }[];
}

function calculateResults(
  questions: {
    id: string;
    position: number;
    question: string;
    options: string[];
    answers: string[];
    points: number;
    note: string | null;
  }[],
  selectedAnswers: Record<string, string[]>
) : {
  newResults: Record<string, boolean[]>;
  earnedPoints: number;
  totalMaxPoints: number;
  hasError: boolean;
} {
  const newResults: Record<string, boolean[]> = {};
  let hasError = false;
  let earnedPoints = 0;

  questions.forEach((question) => {
    const correctAnswers = question.answers;
    const userAnswers = selectedAnswers[question.id] || [];
    const isCorrect =
      correctAnswers.every((a) => userAnswers.includes(a)) &&
      userAnswers.length === correctAnswers.length;

    newResults[question.id] = question.options.map(
      (option) =>
        correctAnswers.includes(option) === userAnswers.includes(option)
    );

    if (isCorrect) {
      earnedPoints += question.points;
    }

    if (userAnswers.length === 0) {
      hasError = true;
    }
  });

  const totalMaxPoints = questions.reduce((sum, q) => sum + q.points, 0);

  return { newResults, earnedPoints, totalMaxPoints, hasError };
}
  
export const Quiz = ({ quiz, questions}: QuizProps) => {
    const { userId } = useAuth();
    
    const router = useRouter();

    const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string[]>>({});
    const [submitted, setSubmitted] = useState(false);
    const [results, setResults] = useState<Record<string, boolean[]>>({});
    const [totalPoints, setTotalPoints] = useState(0);
    const [maxPoints, setMaxPoints] = useState(0);
    const [isCompleated, setIsCompleated] = useState(false);
    const [isRetryment, setIsRetryment] = useState(false);

    useEffect(() => {
        const fetchPreviousAnswers = async () => {
            try {
                const quizResult = await axios.post<QuizResult>(`/api/user/course/quiz/${quiz.id}/quizResult`, {userId});
                if (quizResult.data) { 
                  setSelectedAnswers((quizResult.data.answers as Record<string, string[]>) || {});
                  const { newResults, earnedPoints, totalMaxPoints, hasError } = calculateResults(
                    questions,
                    selectedAnswers
                  );
                  setResults(newResults);
                  setMaxPoints(totalMaxPoints);
                  setIsCompleated(quizResult.data.completed);
                  setTotalPoints(quizResult.data.score);  
                }
            } catch (error: any) {
              if (axios.isAxiosError(error)) {
                if (error.response?.status === 404) {
                  // Do nothing
                  return;
                } else {
                  console.error("Unexpected error fetching previous answers:", error);
                  toast.error("Error fetching previous answers.");
                }
              } else {
                console.error("Unknown error:", error);
                toast.error("An unexpected error occurred.");
              }
            }
        };

        fetchPreviousAnswers();
    }, [userId, quiz.id]);

    const handleNextItem = async () => {
        /*try {
          const { data: nextItem } = await axios.post("/api/user/course/next-page", {
              userId,
              courseId,
              currentChapterId: chapterId, 
              currentItemId: quizId
          });

          if (nextItem) {
              const url = nextItem.type === "lesson"
                ? `/courses/${courseId}/chapters/${nextItem.chapterId}/lessons/${nextItem.id}`
                : `/courses/${courseId}/chapters/${nextItem.chapterId}/quizzes/${nextItem.id}`;
                router.push(url);
          } else {
              toast.success("You have completed all lessons in this chapter!");
              router.push(`/courses/${courseId}`);
          } 
        } catch (error) {
            console.error("Error in handleNextLesson:", error);
            toast.error("Something went wrong.");
        }*/
    };

    const handleAnswerSelect = (questionId: string, option: string) => {
        setSelectedAnswers((prev) => {
        const prevAnswers = prev[questionId] || [];
        if (prevAnswers.includes(option)) {
            return { ...prev, [questionId]: prevAnswers.filter((ans) => ans !== option) };
        } else {
            return { ...prev, [questionId]: [...prevAnswers, option] };
        }
        });
    };

    const handleSubmit = async () => {
      const { newResults, earnedPoints, totalMaxPoints, hasError } = calculateResults(
        questions,
        selectedAnswers
      );
    
      if (hasError) {
        toast.error("Please answer all questions before submitting.");
        return;
      }
    
      setResults(newResults);
      setTotalPoints(earnedPoints);
      setMaxPoints(totalMaxPoints);
      setSubmitted(true);
    
      const allCorrect = earnedPoints === totalMaxPoints;
      if (allCorrect) {
        toast.success("All answers are correct!");
      }
    
      try {
        const apiMethod = isRetryment ? axios.patch : axios.post;

        const response = await apiMethod("/api/user/course/quiz", {
          userId: userId,
          quizId: quiz.id,
          answers: selectedAnswers,
        });
    
        if (response.status === 200) {
          toast.success("Quiz results submitted successfully!");
          router.refresh();
        } else {
          throw new Error("Unexpected response status.");
        }
      } catch (error) {
        console.error(error);
        toast.error("Error submitting quiz results.");
      }
    };

    const handleRetry = () => {
      setSubmitted(false);
      setIsCompleated(false);
      setResults({});
      setTotalPoints(0);
      setIsRetryment(true);
      toast("You can retry the quiz.");
    };
    
      return (
        <div className="flex flex-col gap-y-8 my-12 mx-2 lg:w-[768px] w-full">
          <div className="flex flex-col gap-y-2">
            <h1 className="text-4xl font-semibold">{quiz.title}</h1>
            {quiz.description && (
              <div className="w-full bg-slate-700 rounded-lg shadow-md text-slate-100">
                {quiz.description}
              </div>
            )}
          </div>
    
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            className="space-y-4"
          >
            {questions.map((question) => (
              <QuizQuestionComponent
                key={question.id}
                question={question}
                selectedAnswers={selectedAnswers[question.id] || []}
                onAnswerSelect={(option) => handleAnswerSelect(question.id, option)}
                results={submitted || isCompleated ? results[question.id] : null}
              />
            ))}
    
            <div>
              {!submitted && !isCompleated && (
                <button
                  type="submit"
                  className="bg-indigo-500 text-white px-4 py-2 rounded-md hover:bg-indigo-600"
                >
                  Submit
                </button>
              )}
              {(submitted || isCompleated) && (
                <div className="text-sm mt-4">
                  <p>
                    Your Score: <span className="font-semibold">{totalPoints}</span> /{" "}
                    <span className="font-semibold">{maxPoints}</span>
                  </p>
                  {totalPoints === maxPoints ? (
                    <p className="text-green-500 font-semibold">You answered all questions correctly!</p>
                  ) : (
                    <>
                      <p className="text-red-500 font-semibold">
                        Some answers were incorrect. Review the red-highlighted options.
                      </p>
                      <button
                        type="button"
                        onClick={handleRetry}
                        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 mt-4"
                      >
                        Retry Quiz
                      </button>
                    </>
                  )}
                </div>
              )}
              {/*<div className="w-full flex items-center justify-end">
                  <Button onClick={handleNextItem}>Done! Go to next <GrFormNextLink className="ml-3 w-4 h-4"/></Button>
              </div>*/}
            </div>
          </form> 
        </div>
    );
};